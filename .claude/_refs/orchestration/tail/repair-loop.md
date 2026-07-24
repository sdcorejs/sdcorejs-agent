# Repair Loop - Apply Findings and Re-verify

## Contents

- [Purpose](#purpose)
- [When Invoked](#when-invoked)
- [Inputs](#inputs)
- [Working-tree Preflight](#working-tree-preflight)
- [Repair Ledger](#repair-ledger)
- [Verification Discovery](#verification-command-discovery)
- [Fix Tiers](#fix-tiers)
- [Pass Discipline](#pass-discipline)
- [Workflow](#workflow)
- [Convergence Handoff](#convergence-handoff)
- [Rules](#rules)
- [Cross-references](#cross-references)

Reference body for `sdcorejs-repair-loop`. Load this file only after the
skill triggers.

## Purpose

Turn structured review, verification, lint, typecheck, test, or manual findings
into a deterministic repair loop. The loop validates each finding, applies only
safe fixes, re-runs the source-specific verification, and returns to the caller
tail chain instead of jumping directly to a commit.

## When Invoked

- After `sdcorejs-review` reports findings and the finish gate selected
  "Run review and repair loop".
- After `sdcorejs-ship (verify-before-done mode)` reports failed acceptance
  criteria.
- When the user says "fix findings", "apply review findings", "fix review
  issues", "fix critical issues", or a localized equivalent.
- When linter, typecheck, or test output contains actionable findings with file
  or command evidence.

Do NOT invoke for:

- Single unrelated bugs. Use `sdcorejs-debug`.
- Unstructured complaints with no file, scope, source, command, or review
  evidence. First run `sdcorejs-review` or `sdcorejs-debug`.
- Refactoring requests that need a new spec or plan.

Findings with `file:line` but no suggested fix are allowed, but must be
categorized as `user-decision` by default.

## Inputs

Accepted finding shapes:

- Default review format: `severity` (`Critical`, `Important`, `Minor`),
  `file:line`, `what`, `why`, `suggested fix`.
- Angular/NestJS code-review table format: `Severity`, `Gate`
  (`BLOCKER`, `REQUIRED`, `RECOMMENDED`, `OPTIONAL`, `PASS`, `INFO`),
  `File/Line`, `Issue`, `Risk`, `Suggested fix`.
- Verification, lint, typecheck, or test output with command, exit code, file
  scope, and failure text.
- Manual findings from the user, with the behavioral expectation recorded.
- A redacted `debug_context` from `sdcorejs-debug` when one repair item became a
  single-bug investigation.

Preserve the original source context before any edits:

```yaml
repair_source:
  kind: review-code | verify-before-done | linter | typecheck | test | manual
  track: angular | nestjs | nextjs | test | general
  track_profile: core-ui-angular | legacy-core-ui-angular | plain-angular | sdcorejs-nestjs | plain-nestjs | nextjs-build-website | plain-nextjs | general | n/a
  dimension: code | security | performance | accessibility | architecture | ALL
  file_scope:
    - src/...
  refs_loaded:
    - _refs/...
  refs_skipped:
    - ref: _refs/...
      reason: not applicable to this track_profile
  original_commands:
    - pnpm lint
    - pnpm test
  package_manager: npm | pnpm | yarn | bun
  review_mode: table | scored | blocking
  probes:
    - security
    - accessibility
  review_context:
    source: sdcorejs-review
    # Paste or reference the original review_context block without rewriting it.
```

Rules:

- If the source is `sdcorejs-review`, re-run the same review track,
  `track_profile`, dimension, file scope, mode, loaded refs, skipped refs, and
  probes after repair.
- Do not reclassify a `plain-angular`, `plain-nestjs`, or `plain-nextjs`
  source as an SDCoreJS-specific profile during repair.
- Do not re-run a generic/default code review when the original finding came
  from `security`, `performance`, `architecture`, `accessibility`, or `ALL`.
- If the source is `verify-before-done`, re-run the same acceptance gate, not
  only the failed criterion.
- If the source is `linter`, `typecheck`, or `test`, re-run the discovered
  original commands where possible.
- If the source is `manual`, there may be no source-specific automated
  re-review, but build/lint/test verification must still run where available
  and the summary must ask the user to confirm behavioral correctness.

If `repair_source` is not passed by the caller, infer it from current evidence
and record the inference before editing.

When the finding comes from `sdcorejs-parallel-dispatch`, also require:

```yaml
repair_assignment:
  finding_id:
  original_unit_id:
  repair_owner: original-unit | integration-owner
  workspace_path:
  base_result_ref:
  contract_hash:
  allowed_paths: []
  ownership_transfer_approved: false
```

Default to the original unit, workspace, result, contract revision, and path
scope. Do not repair a unit finding in the parent/integration checkout. A
cross-unit finding requires explicit integration classification and ownership
transfer; update scopes and invalidate affected evidence before editing. Any
repair write stales earlier verification for the affected result. A deferred
blocking finding remains `BLOCKED` and cannot be integrated.

## Working-tree Preflight

Before the first repair pass:

1. Run `git status --short`.
2. Capture a diffstat of currently dirty files.
3. Detect dirty files unrelated to the finding scope.
4. Record the files the repair loop is allowed to touch.

If unrelated dirty changes exist and there is no approved dirty baseline from
the same task, stop and ask the user one numbered decision:

```text
I found unrelated dirty changes before repair. How should I proceed?

1. Continue but restrict edits to finding-scoped files.
2. Continue and allow touching all dirty files.
3. Stop so you can clean or stash changes first.

Reply with `1`, `2`, or `3`.
```

## Repair Ledger

Create a visible Repair ledger before edits and update it after each pass:

| ID | Source | Severity/Gate | File:line | Finding | Verification status | Tier | Action | Reverify |
|---|---|---|---|---|---|---|---|---|
| R1 | review:security | High/REQUIRED | src/auth.guard.ts:42 | Missing permission check | VALID | confirm | patched | pending |

Verification status values:

- `VALID`: finding is correct and code needs a change.
- `STALE`: file, line, or snippet no longer matches live code.
- `MIS-SCOPED`: cited convention or gate does not apply to this file/scope.
- `REDUNDANT`: code already satisfies the finding through another mechanism.
- `UNCLEAR`: cannot decide without more context.

Rules:

- Every finding must be classified before repair.
- Every `VALID` finding must be categorized as `auto`, `confirm`, or
  `user-decision`.
- `STALE`, `MIS-SCOPED`, and `REDUNDANT` findings must not be patched.
- `UNCLEAR` findings must not be patched without either rerunning
  review/debug or asking the user.

## Verification Command Discovery

Discover verification commands from package manager, lockfile, workspace
configuration, `package.json` scripts, and the original failing command. Do not
hardcode `npm` or `tsc`. Do not invent missing scripts.

Rules:

- Detect package manager from lockfiles and `package.json`.
- Do not mix `npm`, `yarn`, `pnpm`, and `bun`.
- Use existing `package.json` scripts only.
- Prefer the project's own build, lint, typecheck, and test scripts.
- For monorepos, respect workspace scripts when detectable.
- If a script does not exist, document the skipped verification with evidence,
  such as `no lint script found in package.json`.
- The original failing command is authoritative when it is still available and
  matches the detected package manager.

## Fix Tiers

| Tier | Definition | Default action |
|---|---|---|
| `auto` | Mechanical, low-risk, single-file or tightly scoped fixes with no semantic decision. | Apply in small batches. |
| `confirm` | Semantic but likely correct fix where the tradeoff is small and explainable. | Ask for explicit approval before editing. |
| `user-decision` | Architectural, product, contract, naming, permission, UX, migration, or preference decisions. | Defer until the user explicitly decides. |

Rules:

- Critical or `BLOCKER` findings can be `auto` only when the fix is genuinely
  mechanical.
- Findings without a suggested fix are `user-decision` by default.
- Confirm-tier findings may be grouped and offered to the user with exactly:

```text
1. Apply all
2. Apply selected
3. Defer all
```

Silence is not approval.

## Pass Discipline

The loop has a hard cap of 3 passes.

Each pass must record:

- pass ID;
- findings attempted;
- files touched;
- debug_context IDs or root hypotheses consumed, when debug was used;
- pre/post diffstat;
- verification command and result;
- unresolved findings;
- whether the pass introduced new failures.

Before each pass, capture enough baseline information to revert that pass if it
makes things worse. If a pass increases failures or causes unrelated
regressions, either revert that pass or ask the user before proceeding.

Avoid big-bang batches:

- Batch `auto` fixes only when they are mechanical and low-risk.
- Cap a batch to about 5-8 mechanical findings, or one coherent risk/file group
  per pass.
- Never hide `confirm` or `user-decision` findings inside an auto batch.
- Split large finding sets into sub-passes and verify incrementally.

## Workflow

### 0. Preserve Source Context

Record `repair_source`, current branch, dirty baseline, original commands, file
scope, and review mode before editing.

### 1. Verify Findings

For each finding:

1. Check whether the live file/line still matches the finding.
2. Check whether the cited convention applies to this scope.
3. Check whether existing code already satisfies the intent through another
   mechanism.

Update the Repair ledger with `VALID`, `STALE`, `MIS-SCOPED`, `REDUNDANT`, or
`UNCLEAR`.

If more than 30% of findings are not `VALID`, report that the source may be
stale or low-signal and suggest rerunning the original review/debug/verification
before continuing.

### 2. Categorize Valid Findings

Assign `auto`, `confirm`, or `user-decision` to every `VALID` finding and record
the reason in the ledger.

### 3. Apply One Pass

Apply only the approved scope for the current pass:

- `auto` tier can proceed when it is mechanical and inside the allowed file
  scope.
- `confirm` tier requires the numbered approval prompt.
- `user-decision` tier requires explicit user approval before editing.

Do not edit tests merely to make production code pass. Only edit tests when:

- the finding is explicitly in test code;
- adding regression coverage;
- updating a test to match an approved contract change;
- or the user explicitly approved a test-contract update.

Never weaken assertions, remove coverage, skip tests, or mark tests pending to
make verification pass.

If one `VALID` finding is actually a concrete bug that needs reproduce,
isolate, hypothesize, and root-cause work, call `sdcorejs-debug` for that item
instead of improvising a parallel debug process. Pass the preserved
`repair_source`, original finding ID/source, `review_context` when present,
original commands, package-manager evidence, and any source-specific logs. When
debug returns, carry its redacted `debug_context` into this Repair ledger and
continue with the source-specific re-verification below.

### 4. Re-verify Per Source

After each pass:

| Source | Re-verify action |
|---|---|
| `review-code` | Re-run `sdcorejs-review` with the same track, `track_profile`, dimension, file scope, mode, refs, and probes from `review_context`. |
| `verify-before-done` | Re-run `sdcorejs-ship (verify-before-done mode)` for the same acceptance gate. |
| `linter` | Re-run the original lint command or discovered lint script. |
| `typecheck` | Re-run the original typecheck command or discovered typecheck/build script. |
| `test` | Re-run the original test command or the smallest matching existing test script. |
| `manual` | Run discovered build/lint/test commands where available, then ask the user to confirm behavioral correctness. |

Look for:

- resolved findings;
- new failures introduced by the pass;
- findings that remain after the attempted fix.

Do not claim convergence until the source-specific re-verification has run or a
skipped check is explicitly documented with evidence.

### 5. Iterate Or Escalate

Continue until:

- no unresolved blocking findings remain;
- remaining non-blocking findings are explicitly deferred or acknowledged;
- or 3 passes have run.

If the loop does not converge after 3 passes, stop and ask:

```text
The repair loop reached the 3-pass cap and still has blocking findings.

1. Defer these findings with an explicit risk note.
2. Change approach for the stuck findings.
3. Revert the last repair pass and reassess.

Reply with `1`, `2`, or `3`.
```

## Convergence Handoff

After convergence, return to the caller's tail chain.

If invoked from a finish-gate review, continue in this order:

1. `sdcorejs-documentation (code-documentation mode)`, if source changed.
2. `sdcorejs-documentation (write-technical-doc mode)`, if selected.
3. `_refs/orchestration/tail/auto-docs.md`.
4. `sdcorejs-documentation (write-user-guide mode)`, if selected.
5. `_refs/orchestration/tail/auto-task-tracker.md`.
6. `sdcorejs-explore (memories mode)`, if durable knowledge surfaced.
7. `sdcorejs-ship (verify-before-done mode)`.
8. `sdcorejs-ship (branch-ready mode)` as the final read-only gate over the
   final diff.

No writes after branch-ready unless branch-ready is run again.

If invoked directly by the user, run discovered verification commands, then
offer explicit next steps:

```text
Repair summary complete. Choose next step:

1. Run sdcorejs-ship in verify-before-done mode.
2. Stop after this repair summary.
3. Prepare commit only after ship and branch-ready pass for the current `HEAD` or diff.

Reply with `1`, `2`, or `3`.
```

Do not hand off directly to `sdcorejs-git (commit mode)` by default. Direct
commit handoff is allowed only when `sdcorejs-ship (verify-before-done mode)`
and `sdcorejs-ship (branch-ready mode)` passed for the
current `HEAD` or diff, or when the caller explicitly requested a commit after
those gates with any verification deferral recorded.

## Rules

### MUST DO

- Preserve `repair_source` before editing.
- Preserve `review_context` exactly when the source is `sdcorejs-review`.
- Run working-tree preflight before the first pass.
- Keep the Repair ledger visible and current.
- Classify every finding before touching code.
- Re-run the source-specific verification after each pass.
- Use package-manager and script discovery instead of hardcoded commands.
- Keep passes small and reversible.
- Require explicit approval for semantic and user-decision fixes.
- Protect tests from being weakened.

### MUST NOT

- Patch stale, mis-scoped, redundant, or unclear findings.
- Apply user-decision tier without asking.
- Treat silence as approval.
- Run more than 3 passes silently.
- Hide new regressions inside a "fixed" summary.
- Commit directly from repair-loop by default.
- Weaken tests, remove coverage, skip tests, or mark tests pending to make
  verification pass.

## Cross-references

- `sdcorejs-review` - produces structured review findings.
- `sdcorejs-debug` - handles single-bug investigation.
- `sdcorejs-ship (verify-before-done mode)` - acceptance verification after
  convergence.
- `sdcorejs-ship (branch-ready mode)` - branch hygiene before commit or PR.
