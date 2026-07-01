# Fix Loop — Apply Review Findings + Iterate

Reference body for `sdcorejs-repair-loop`. Load this file only after the skill triggers.

## Purpose
A review finding without a fix loop is just a complaint. This skill turns review findings into a closed-loop fix→re-verify→fix cycle until the code is shippable. It supports the default Critical/Important/Minor format and Angular/NestJS code-review table formats with `Gate` values.

## When invoked
- After `sdcorejs-review` writes findings (auto-invoked)
- User says "fix findings", "apply review findings", "fix review issues", "fix critical issues", or localized equivalents
- A linter / typecheck / test reports findings that match the same shape
- After a `superpowers:receiving-code-review` cycle, when the parent agent decides to act on feedback

Do NOT invoke for:
- Single unrelated bug (use `sdcorejs-debug`)
- Findings that haven'<localized text>'t fix")
- Refactoring requests (different workflow)

## Inputs
- A list of findings in either supported shape:
  - Default review format: `severity` (Critical / Important / Minor), `file:line`, `what`, `why`, `suggested fix`
  - Angular/NestJS code-review table format: `Severity`, `Gate` (`BLOCKER` / `REQUIRED` / `RECOMMENDED` / `OPTIONAL` / `PASS` / `INFO`), `<localized text>`, `<localized text>`, `<localized text>`, `<localized text>`
- Source can be: chat message, doc file in `.sdcorejs/docs/<track>/`, or stdout from a linter / test runner
- **source** (required): origin of the findings — determines which re-verify command runs in Step 5

  | source value | Meaning | Re-verify command |
  |---|---|---|
  | `review-code` | Findings from `sdcorejs-review` | Re-invoke `sdcorejs-review` with same file scope |
  | `verify-before-done` | Failed acceptance criteria from `sdcorejs-ship (verify-before-done mode)` | Re-invoke `sdcorejs-ship (verify-before-done mode)` for the specific failed criteria |
  | `linter` | Findings from `npm run lint` / `tsc --noEmit` | `npm run lint && tsc --noEmit` (or `npm run build`) |
  | `manual` | Human-reported findings | No automated re-verify; report fix status to user |

If `source` is not passed explicitly by the caller, infer it from context before proceeding:
- Findings came from a `sdcorejs-review` invocation → use `review-code`
- Findings are failed acceptance criteria from `sdcorejs-ship (verify-before-done mode)` → use `verify-before-done`
- Findings came from `npm run lint` / `tsc --noEmit` / a CI log → use `linter`
- Findings were written by a human in chat without a tool origin → use `manual`

## Workflow

### 0. Verify each finding is genuine (BEFORE categorizing)

A review tool — automated or human — is faster than careful. Some findings will be reviewer misunderstandings of context the code already handles correctly. Applying those fixes is worse than ignoring them: you change correct code, the convention drifts, and the original intent is lost.

For each finding, take 30 seconds to verify it BEFORE touching anything. This step is borrowed from `superpowers:receiving-code-review` — technical rigor over performative agreement.

Run this 3-question check per finding:

1. **Does the file:line actually contain what the finding describes?**
   - Read the file. If the snippet doesn't match (file changed since review, wrong line number, wrong file), the finding is stale → drop it.
2. **Does the convention the finding cites actually apply here?**
   - Check the relevant skill / `_refs/` file. Conventions have scope ("primary list page", "writable endpoints only", "long-form pages"). If the file is out of scope, the finding is mis-targeted → drop it.
3. **Does the existing code already satisfy the intent via a different mechanism?**
   - Example: finding says "missing null check", but the code path has an upstream guard that makes the value impossible-null. The check is redundant noise → drop with a brief rationale.

Mark each finding as one of:

| Status | Meaning | Next |
|---|---|---|
| **VALID** | finding is correct, code needs change | proceed to Step 1 categorization |
| **STALE** | snippet doesn't match the live file (file changed) | drop; note in summary |
| **MIS-SCOPED** | convention doesn't apply here | drop with 1-line reason in summary |
| **REDUNDANT** | code already handles it via a different mechanism | drop with reference to the existing mechanism |
| **UNCLEAR** | can't tell without more context | ASK user, do not auto-drop |

Report rejections to the user in the same summary as the fixes:

> "Verified 18 findings: 14 valid, 2 stale (files moved during refactor), 1 mis-scoped (`audit columns` rule applies to primary list, this is a sub-table), 1 redundant (null check upstream at `service.ts:88`)."

This protects against:
- Linters that over-trigger on edge cases
- AI reviewers misreading context
- Conventions cited outside their scope (e.g. "use OnPush" applied to a host component that intentionally needs default for projection)

Edge case: if MORE than 30% of findings turn out STALE/MIS-SCOPED/REDUNDANT, the review itself is low-signal — surface this to the user and suggest re-running `sdcorejs-review` with refreshed input before continuing.

### 1. Categorize findings into 3 fix tiers

| Tier | Definition | Default action |
|---|---|---|
| **Auto-apply** | Mechanical, single-file, no semantic decision (e.g. missing `OnPush`, wrong import path, dead variable, missing `multi: true`) | Apply in batch without asking |
| **Confirm-then-apply** | Semantic but obvious (e.g. wrong DI scope, missing null check that has documented contract, swap `formControlName` → `[form]+name=`) | Show user the proposed diff, apply on OK |
| **User-decision** | Architectural / scope / preference (e.g. "split this 200-line component", "rename this token", "add caching layer") | Surface to user, defer until they decide |

Rules for categorization:
- Critical that's auto-apply → still auto-apply, but mention in summary
- Important that's user-decision → never auto-apply
- Any finding with no `suggested fix` → user-decision by default (you don't know what they want)

### 2. Apply auto-tier in one batch

Single message, one edit per finding. Group findings by file to minimize round trips.

After batch:
- Run `npm run lint` (catches new convention violations)
- Run the project's typecheck (`tsc --noEmit` or `npm run build`)
- Run the relevant test slice — the one that should now PASS the finding

Report:
> "<localized text>"

### 3. Surface confirm-tier with proposed diffs

For each, show the user a compact diff preview:
```
[Important] src/libs/catalog/features/product/services/product.service.ts:42
  Reason: Service should be `providedIn: 'root'`, not route-scoped (see _refs/angular/write-code/init-module.md)
  Proposed:
    - @Injectable()
    + @Injectable({ providedIn: 'root' })
```

Group them, then ask: "<localized text>". Default to "all" if they're all in the same category and skill-rule-driven.

### 4. Defer user-decision tier
List them with their file:line and the question. Do NOT touch the code. User answers, then this skill re-runs with the answer applied as a new "confirm-then-apply" finding.

### 5. Re-run per source

After tier 1 + tier 2 fixes are applied, re-verify using the tool that matches the
invocation source:

| source | Re-verify action |
|---|---|
| `review-code` | Re-invoke `sdcorejs-review` with the same file scope as the original review |
| `verify-before-done` | Re-invoke `sdcorejs-ship (verify-before-done mode)` (full suite — the skill re-checks all criteria; previously-passing criteria will still pass, so the run is safe and complete) |
| `linter` | `npm run lint && tsc --noEmit` (or the project's typecheck equivalent) |
| `manual` | No automated re-verify. Report: "<localized text>" and pause for the user |

Look for:
- **Resolved findings** — same file:line no longer flagged → tick off
- **New findings introduced by the fix** — flag as regressions; do NOT tick off
- **Same finding still present** — fix didn't take; investigate (cached test, wrong file,
  syntax error swallowed by the build)

### 6. Iterate
Loop steps 2–5 until:
- 0 unresolved blocking findings remain. Blocking means `Critical`/`Important` in the default format, or `BLOCKER`/`REQUIRED` in Angular/NestJS code-review table mode. A blocking finding counts as resolved only when it is fixed, verified stale/mis-scoped/redundant, or explicitly deferred by the user.
- All remaining findings are non-blocking (`Minor`, `RECOMMENDED`, `OPTIONAL`, `INFO`, or `PASS`) that the user has acknowledged as defer/won't-fix when action is still possible.
- OR: 3 iterations and the loop hasn't converged → ESCALATE to user

### 7. Convergence escalation
If after 3 passes there are still blocking findings:
- One of the "fixes" is introducing a regression that the next pass catches → systematic issue, ask user
- The finding is mis-categorized (auto-tier when it's actually user-decision) → re-categorize
- Two findings are mutually exclusive (fix A introduces B) → user must pick

Frame it as:
> "Looped 3 times; 2 findings still do not converge:
> - X (still appears after fix Y)
> - Z (tried 3 approaches and lint still fails)
>
> Choose next step:
> 1. Defer (defer) - keep these findings open and ship only if you explicitly accept the risk.
> 2. Change approach (change) - pick a different fix direction for the stuck finding.
> 3. Revert batch (revert) - undo the attempted batch and retry from scratch.
>
> Reply with `1`, `2`, or `3`."

### 8. Final commit prep
Once converged, hand off to `sdcorejs-git (commit mode)`. Commit message shape by source:

```
# source = review-code
fix(<scope>): apply N review findings (Critical: A, Important: B, Minor: C)

# source = verify-before-done
fix(<scope>): resolve N failed acceptance criteria

# source = linter
fix(<scope>): resolve N lint / typecheck errors

# source = manual
fix(<scope>): apply N manually-reported fixes
```

DO NOT commit before final lint + test pass.

## Examples

### Auto-tier only
```
Findings:
  [Critical] missing OnPush in 3 components
  [Critical] formControlName usage in 9 places (should be [form]+name=)
  [Minor] trailing whitespace in 4 files

Loop pass 1:
  - Apply 16 edits in one batch
  - npm run lint ✓
  - npm run test ✓
  - Re-review: 0 findings
Done. Hand off to sdcorejs-git (commit mode).
```

### Mixed tier with user-decision
```
Findings:
  [Critical] @Injectable() → @Injectable({ providedIn: 'root' }) (5 services)  -- auto
  [Important] split ProductService into ProductCommandService + ProductQueryService  -- user-decision
  [Minor] missing JSDoc on 12 methods  -- auto (run sdcorejs-documentation comment-code mode)

Pass 1:
  Auto: applied 5 + ran sdcorejs-documentation (comment-code mode) → JSDoc added
  Skip: user-decision finding deferred
  Re-review: 0 Critical, 1 Important deferred, 0 Minor
  Table-mode equivalent: 0 BLOCKER, 1 REQUIRED explicitly deferred, 0 blocking unresolved
Reported to user:
  "<localized text>"
```

### Convergence failure
```
Pass 1: fix [Important] X → introduces [Critical] Y
Pass 2: fix [Critical] Y → reintroduces [Important] X (different angle)
Pass 3: same loop

Escalate: "<localized text>"
```

## Rules

### MUST DO
- Categorize EVERY finding before touching code
- Auto-apply only mechanical, single-file changes
- Show diffs for confirm-tier; never silently apply semantic changes
- Defer user-decision tier without touching code
- Re-run the originating review/lint/test after each batch
- Hard cap at 3 iterations before escalating
- Verify lint + typecheck + tests pass before claiming the loop is converged
- Surface introduced regressions explicitly (don't silently include them in "fixed" count)

### MUST NOT
- Skip a finding because "it's minor and tests pass" — Minor still goes into the report
- Apply user-decision tier without asking
- Hide failed re-review behind "fix applied" status
- Disable a failing test to "make the loop converge"
- Bypass `--no-verify` if hooks reject the fix commit
- Run >3 iterations silently — escalate
- Apply a fix that doesn't match the finding's suggested approach without explaining why

## Anti-patterns
- **Whack-a-mole**: each fix introduces a new finding, loop forever — escalate at pass 3
- **Cosmetic compliance**: rename a variable to silence a linter rule without understanding why the rule exists
- **Test-deletion fix**: removing the failing test instead of fixing the code
- **Big-bang batch**: apply all 30 findings in one go, then nothing works, can't bisect which fix broke it
- **Silent regression**: fix introduces new bug, parent agent reports "all done"
- **Convention override**: applying a fix that contradicts the convention the review used to flag it
- **Premature commit**: commit before final re-review passes

## Cross-references
- `sdcorejs-review` (track-specific) — produces the findings this skill consumes
- `sdcorejs-debug` — for single-bug fix workflow (use when the input isn't a structured findings list)
- `sdcorejs-ship (verify-before-done mode)` — final gate AFTER this loop converges
- `sdcorejs-git (commit mode)` — handoff destination after convergence
