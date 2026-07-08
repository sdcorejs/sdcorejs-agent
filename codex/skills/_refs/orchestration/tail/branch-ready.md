# Branch Ready - Hygiene Gate Before Commit/PR

Reference body for `sdcorejs-ship (branch-ready mode)`. Load this file only
after that skill triggers.

## Purpose

Acceptance criteria passing in `sdcorejs-ship (verify-before-done mode)` does
not prove that the branch is ready for commit or PR. Branch-ready is the
read-only hygiene sweep that checks dirty state, focused tests, conflict
markers, debug output, suspected secrets, unexpected binaries, and available
project verification scripts before `sdcorejs-git` creates artifacts.

It does not modify code. It surfaces issues so the user can fix, acknowledge,
or defer them.

## When Invoked

- Automatic: in the tail-call chain after `sdcorejs-ship (verify-before-done mode)` and before any `sdcorejs-git` commit or PR handoff.
- Manual: user says "is this branch ready", "ready to ship", "check branch", "check before commit", "check before PR", "final gate", or "branch hygiene".

Do not invoke for noisy mid-work checks unless the user explicitly wants a
snapshot.

## Evidence Header

Capture this before reporting:

```yaml
branch_ready_evidence:
  branch:
  current_HEAD:
  associated_HEAD_or_diff:
  package_manager:
  commands_run:
  commands_skipped:
  reason_for_each_skip:
  result:
```

The `associated_HEAD_or_diff` value must identify the current `HEAD` plus dirty
diff state, or the exact clean `HEAD` when the tree is clean.

## Package Manager And Script Discovery

Discover verification commands from package manager signals, lockfiles,
workspace configuration, project config, and `package.json` scripts.

Rules:

- Read root `package.json` and relevant workspace package files.
- Prefer the `packageManager` field when present.
- Otherwise infer from `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`, `npm-shrinkwrap.json`, `bun.lock`, or `bun.lockb`.
- Stop and ask if package-manager signals conflict.
- Do not mix `npm`, `pnpm`, `yarn`, and `bun`.
- Do not invent missing scripts.
- Missing scripts are not silent. Record them as skipped with evidence, such as `no lint script found in package.json`.
- Prefer scripts already defined by the project, such as `lint`, `typecheck`, `check`, `test`, `test:e2e`, `build`, `build:site`, or repo-documented equivalents.
- For monorepos, respect workspace/package scripts when detectable and run the smallest relevant verification for changed packages.

Use the detected package manager placeholder in reports, for example
`<pm> run lint`, only when the `lint` script actually exists.

## Secret Redaction

Secret probes must redact values.

Rules:

- Secret scan must run before full diff details are printed.
- Never echo secret values from `.env`, local config, CI files, shell output, source files, or Git diffs.
- Never print full lines that contain likely secret values.
- For suspected findings, report only file path, line number if available, key/category name, risk reason, and redacted evidence such as `API_KEY=[REDACTED]`.
- If suspected secrets are staged, mark branch-ready `BLOCKED`.

## Checks

Run read-only checks and aggregate the full result. Do not bail early unless a
command would expose secrets.

Severity values:

- `Blocker`: must resolve before commit/PR unless the user explicitly accepts an unverified artifact path where allowed by `sdcorejs-git`.
- `Warning`: surface for user decision.
- `Info`: useful context.

### 1. Branch And Dirty State

```bash
git branch --show-current
git rev-parse HEAD
git status --short
```

- Any unstaged, staged, or untracked files are blocker-level for PR mode unless the user asked for draft/manual PR text only.
- Dirty files may be acceptable before commit mode, but they must be itemized and passed to the `sdcorejs-git` Commit Scope Ledger.

### 2. Protected Branch State

Block commit/PR handoff from protected branches:

- `main`
- `master`
- `trunk`
- `production`
- `stable`
- `release/*`
- repo- or user-named protected branches

Branch-ready may report findings from a protected branch, but it must not mark a
protected branch as ready for direct commit, PR, or push.

### 3. Secret And Credential Risk

Inspect staged and dirty path names plus redacted content summaries for likely
secret categories:

- `.env` files without `.example` suffix
- private key files
- service-account or credential JSON files
- likely key names such as `API_KEY`, `SECRET`, `PASSWORD`, `TOKEN`, `PRIVATE_KEY`, `CLIENT_SECRET`

Report redacted evidence only. Suspected staged secrets are blockers.

### 4. Focused Tests And Debug Statements

Inspect staged and dirty files only, not the whole repository:

- `console.log`, `console.debug`, and `debugger` are blockers unless the project convention explicitly allows them.
- `console.warn` and `console.error` are warnings unless clearly accidental.
- focused test markers such as `.only`, `fdescribe`, or `fit` are blockers.
- skipped test markers such as `.skip`, `xdescribe`, or `xit` are warnings unless explicitly part of a test plan.

Avoid commands that print full secret-bearing lines. Summarize matches with file
and line only when the surrounding text is safe.

### 5. Conflict Markers

Inspect staged and dirty diffs for conflict markers. Any marker is a blocker.

### 6. Large Or Binary Files

Inspect staged and dirty path lists plus diffstat:

- large additions are warnings unless they are expected lockfile or generated artifacts;
- unexpected binaries are warnings or blockers depending on repo policy;
- generated/vendor/build output should not be included unless explicitly requested and safe.

### 7. Verification Scripts

From discovered package scripts, run available relevant checks:

- lint or equivalent static checks;
- typecheck or equivalent compile-time checks;
- test or focused test scripts;
- build or package-specific build scripts.

Any non-zero exit is a blocker. Missing scripts must be listed in
`commands_skipped` with evidence. Do not run install commands to hide missing
dependency or setup problems.

### 8. Branch State Against Base

Resolve the default remote base when possible:

```bash
git symbolic-ref refs/remotes/origin/HEAD
git fetch --quiet
git rev-list --count origin/<base>..HEAD
git rev-list --count HEAD..origin/<base>
```

- zero commits ahead is a warning for PR mode;
- many commits ahead is a warning to consider splitting;
- local branch behind remote base is info unless it creates merge risk;
- if remote/base cannot be resolved, report the skip with evidence.

### 9. `.sdcorejs/` Artifacts

For non-trivial SDCoreJS track work, surface whether fresh session docs, task
tracker updates, product/design/test evidence, or memories are present when
expected. This is advisory and should not replace acceptance verification.

### 10. Specialized Review Hints

Suggest `sdcorejs-review` dimensions when the changed file set indicates high
risk:

| Condition | Suggestion |
|---|---|
| many files across several modules | architecture review |
| auth, permission, token, role, crypto, or secret paths changed | security review |
| many UI components or new screens changed | accessibility review |
| performance-sensitive code paths changed | performance review |

Omit this section when no suggestion applies.

## Output Format

Match the user's language. Output one block:

```markdown
## Branch Ready Check - `<branch-name>`

### Blockers (N)
- [check name] file:line - what was found - suggested fix

### Warnings (M)
- [check name] file:line - what was found - user decision needed

### Info (K)
- [check name] - context

### Summary
- package_manager: <npm|pnpm|yarn|bun|none|unknown>
- commands_run:
- commands_skipped:
- reason_for_each_skip:
- result: READY | READY WITH WARNINGS | BLOCKED
- associated_HEAD_or_diff:
- Files changed: N staged, M unstaged, U untracked
- Commits ahead of <base>: N

### Verdict
READY - all blockers clear and required discovered commands passed.

READY WITH WARNINGS - blockers clear, warnings remain, and the user must acknowledge before git artifacts.

BLOCKED - fix blockers and re-run branch-ready.
```

When the verdict is `READY` or `READY WITH WARNINGS`, state that the next step
is `sdcorejs-git (commit mode)` or `sdcorejs-git (PR mode)` only when the user
asked for that artifact or the caller is the verified ship chain.

## Edge Cases

### CI-Only Project

Some projects rely entirely on CI. If local lint/test/build scripts are absent,
record each skipped command with evidence such as `no test script found in
package.json`; do not present the branch as fully locally verified.

### Pre-Merge Vs Pre-Commit

This reference runs at the pre-commit/pre-PR boundary. For PR-time CI results,
include the CI evidence in `sdcorejs-git (PR mode)` when available.

### Multiple Tracks In Monorepo

If both frontend and backend packages changed, discover and run relevant
scripts for each package. If only one package changed, prefer focused commands
for that package.

### Worktrees

If `git worktree list` shows multiple worktrees on the same branch, surface it
as info.

## Rules

### MUST DO

- Run read-only checks before reporting.
- Distinguish blockers, warnings, and info clearly.
- Discover package manager and package scripts before verification commands.
- Record skipped checks with evidence.
- Redact suspected secrets.
- Include `package_manager`, `commands_run`, `commands_skipped`, `reason_for_each_skip`, `result`, and `associated_HEAD_or_diff` in the summary.
- Match the user's language at runtime.

### MUST NOT

- Modify files.
- Run destructive Git commands.
- Hardcode one package manager as universal.
- Mix package managers.
- Invent missing scripts.
- Skip missing scripts without reporting evidence.
- Run install commands to silence environment problems.
- Mark a protected branch ready for direct commit, PR, or push.
- Bypass a blocker silently when the user says "commit anyway".
- Print secret values or raw suspicious lines.
- Run heavy tag fetches for branch state checks.

## Anti-Patterns

- Gate that always says `READY`.
- Gate that blocks on every minor warning.
- Running this before `sdcorejs-ship (verify-before-done mode)` in the normal tail chain.
- Modifying files to fix warnings before reporting.
- Treating missing scripts as success.

## Cross-References

- `sdcorejs-ship (verify-before-done mode)` - runs before branch-ready in the tail chain.
- `sdcorejs-git (commit mode)` - consumes branch-ready evidence for commits.
- `sdcorejs-git (PR mode)` - consumes branch-ready evidence for PRs.
- `sdcorejs-debug` - use when a blocker is a failing test or command that needs root-cause work.
