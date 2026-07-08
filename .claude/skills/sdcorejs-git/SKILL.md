---
name: sdcorejs-git
description: Git artifact workflow. Use for commit/save changes, create PR, push verified branch, changelog, release notes, diff since tag, PR text, or executor worktree isolation. Do not use for readiness/ship gates; use sdcorejs-ship first, then this for commit/PR/changelog artifacts. Applies to all tracks and this repo. Runtime-localized.
allowed-tools: Bash, Read, Grep, Glob, Write, Edit
---

# Git

## Purpose

One skill for Git artifacts:

- isolate risky or parallel work from the user's current branch
- create a scoped Conventional Commit
- push a verified branch
- open or update a pull request
- write release notes or CHANGELOG entries

Readiness and final delivery gates live in `sdcorejs-ship`.

`sdcorejs-git` creates artifacts only. It is not the readiness gate, it must not
repair source files, and it must not create commits, pushes, or PRs as a
substitute for verification.

## Shared Protocols

Before executing this skill:

1. Read and apply `_refs/shared/tasklist.md` for non-trivial execution tasks.
2. Read and apply `_refs/shared/persona.md` if a project persona exists.
3. Read and apply `_refs/shared/project-context.md` for project memory, resume checkpoints, summaries, specs/plans, tasks, and relevant memories.
4. Current user request, current files, diffs, logs, failing tests, and command output override stored context.
5. Before presenting user-facing choices, approval gates, yes/no questions, or mode selections, read and apply `_refs/shared/user-choice-prompt.md` so options are presented as sequential numbered choices.

## Mode Selection

| Mode | Trigger examples | Output |
|---|---|---|
| `workspace` | "worktree", "isolate workspace", "do not touch current branch", "run in parallel" | isolated workspace decision plus baseline result |
| `commit` | "commit", "commit changes", "save changes" | one scoped Conventional Commit |
| `pr` | "create PR", "open PR", "gh pr create", "PR text" | pushed current branch plus PR URL or local PR draft |
| `changelog` | "write changelog", "update CHANGELOG", "release notes", "what changed since vX.Y.Z" | Keep a Changelog entry plus semver recommendation |

If multiple modes match, choose the narrowest explicit artifact request:
`commit`, `pr`, `workspace`, and `changelog` are artifact modes; readiness,
delivery, dependency updates, release readiness, and "is this ready" belong to
`sdcorejs-ship`.

## Mode Precedence Guard

Before any artifact mode, classify the user's intent.

Delegate to `sdcorejs-ship` first when the prompt includes readiness or delivery
intent such as ship, ready, done, push, merge, release, create PR, open PR,
submit PR, or ready to merge and current ship evidence is missing or stale for
the current `HEAD` or diff.

`sdcorejs-git` may proceed only when at least one condition is true:

- the user explicitly requested an artifact-only action, such as "commit these docs", "write changelog", or "create worktree";
- `sdcorejs-ship (verify-before-done mode)` and `sdcorejs-ship (branch-ready mode)` have already passed for the current `HEAD` or diff;
- the caller explicitly delegated from `sdcorejs-ship` after passing those gates;
- the user explicitly accepted a docs-only, prompt-only, chore-only, or unverified artifact with the verification caveat recorded.

Do not create commits, pushes, or PRs as a substitute for verification. If the
prompt is delivery-oriented and evidence is absent or stale, stop and delegate:
"Run `sdcorejs-ship` first so verify-before-done and branch-ready evidence can
be tied to the current `HEAD` or diff."

## Mode-Specific Write Boundaries

- `workspace` mode may create a branch or worktree and inspect baseline state. It must not edit source files.
- `commit` mode may inspect, stage explicit included paths, and create a commit. It must not edit source files.
- `pr` mode may push the current branch and create or update PR text after gates pass. It must not edit source files.
- `changelog` mode may edit `CHANGELOG.md`, release note files, or repo-defined release artifact files only when the user explicitly requested changelog or release-note work and the scope is clear.
- No mode may auto-run source formatting, mirror sync, code generation, or patch fixes unless the user explicitly requested that operation or the verified caller delegated a known artifact sync step.
- If mirror sync is required by repo policy, report that source and mirrors are out of sync and delegate to the appropriate sync/test workflow. Do not silently edit generated mirrors.

## Shared Pre-Flight

Run relevant read-only checks first:

```bash
git rev-parse --show-toplevel
git branch --show-current
git rev-parse HEAD
git status --short
git remote -v
```

Protected branches are hard stops for commit, PR, and push modes:

- `main`
- `master`
- `trunk`
- `production`
- `stable`
- `release/*`
- any repo- or user-named protected branch convention

Never commit directly from main, master, trunk, production, stable, or
release/* by default. Never create a PR directly from those branches. Do not ask
the user whether to continue directly on a protected branch.

Offer only safe choices:

1. Create a feature branch and continue.
2. Create an isolated worktree.
3. Stop.

There is no continue on protected branch option.

If a repo has a different protected branch convention, let the user name it,
record it in the ledger, and still refuse direct commit, PR, or push from that
protected branch.

## Secret Redaction Protocol

Run secret screening before printing diff details, commit messages, PR bodies,
or changelog excerpts.

Rules:

- Never echo secret values from `.env`, local config, CI files, shell output, source files, Git diffs, or grep output.
- Never print full lines that contain likely secret values.
- If a command would print secret values, do not run it; use redacted summaries instead.
- For suspected secret findings, report only file path, line number if available, key or category name, reason it is risky, and redacted evidence such as `API_KEY=[REDACTED]`.
- Do not include secret values in commit messages, PR bodies, changelog entries, release notes, or final summaries.
- If suspected secrets are staged or inside the PR diff, stop before commit or PR and require remediation.

## Commit Scope Ledger

Before any staging or commit, show a visible Commit Scope Ledger:

```yaml
Commit Scope Ledger:
  branch:
  current_HEAD:
  protected_branch_status:
  staged_paths:
  unstaged_paths:
  untracked_paths:
  included_paths:
  excluded_dirty_paths:
  generated_mirrors:
  docs_or_task_artifacts:
  suspected_secret_paths:
  secret_scan_result:
  ship_evidence:
    mode:
    commands:
    result:
    associated_HEAD_or_diff:
    timestamp_if_available:
  branch_ready_evidence:
    commands:
    result:
    associated_HEAD_or_diff:
    timestamp_if_available:
  commit_type:
  commit_scope:
  commit_message_preview:
```

Ledger rules:

- Always inspect `git status --short` before staging or committing.
- Always inspect staged diffstat and staged file names when staged files exist.
- Always inspect unstaged diffstat and untracked file names.
- If pre-existing staged changes exist, do not assume they belong to this commit.
- If staged, unstaged, and untracked changes coexist, ask the user to choose the commit scope unless the current task context clearly owns all changed files.
- If no staged changes exist, stage only explicit included paths or explicit path groups.
- Use explicit path staging, for example `git add -- path/to/file another/file`.
- Never use dot-all staging or all-index staging flags.
- Never stage unrelated work.
- Never stage generated, vendor, build, cache, log, local env, or temporary output by default.
- Exclude `node_modules`, `dist`, `build`, `coverage`, `.next`, `.turbo`, `.angular`, cache folders, local env files, logs, and temporary files unless explicitly requested and safe.
- If the user says "commit all", still show the ledger and ask for confirmation when unrelated or ambiguous changes exist.
- If files appear unrelated to the current task, stop and ask:
  `1. Commit only task-scoped files` / `2. Include selected additional files` / `3. Stop so the user can clean or stash changes`.
- Do not silently include unrelated staged files.
- Do not commit excluded dirty paths.
- Include generated mirrors only when repo mirror policy expects them and they are part of the current source/ref change.
- Include docs/task artifacts only when they are intentional artifacts from the current workflow.

Documentation preferences are project artifacts. When a commit or PR includes
work that used or changed saved documentation settings, include
`.sdcorejs/documentation/**` with the same feature change unless the user
explicitly asks for a separate commit. Do not treat these files as disposable
session state.

## Verification Evidence Rules

- Feature/source-code commits should have current `sdcorejs-ship (verify-before-done mode)` and `sdcorejs-ship (branch-ready mode)` evidence tied to the current `HEAD` or diff.
- Docs-only, prompt-only, or chore-only commits may not need full product acceptance verification, but they still need appropriate hygiene checks and a clear verification note.
- A stale verification run from before the current diff is not sufficient.
- If verification is deferred, do not present the commit or PR as verified.
- If verification is deferred or not applicable, include one of these exact lines in the commit body or final summary:
  - `Verification: deferred by user`
  - `Verification: not applicable, docs-only change`
- PR mode requires current verify-before-done and branch-ready evidence unless the PR is documentation-only or the user accepts an unverified draft with a clear warning.

## Mode: workspace

Read `_refs/orchestration/workspace-isolation.md` completely, then follow it to:

- detect whether the current checkout is already isolated
- ask consent before creating a worktree unless the user already requested one
- prefer a native harness worktree feature when available
- fall back to `git worktree` only when safe
- discover package manager and package scripts before baseline checks
- run only existing baseline scripts appropriate to the changed stack
- report skipped baseline checks with evidence

This mode is mostly called by `sdcorejs-execute-plan` or
`sdcorejs-parallel-dispatch`. When invoked directly, report the workspace path,
base branch, new branch, package manager, baseline commands run, skipped checks,
existing baseline failures, and blockers.

## Mode: commit

1. Inspect:

```bash
git branch --show-current
git rev-parse HEAD
git status --short
git diff --stat
git diff --staged --stat
git diff --staged --name-status
git log -5 --oneline
```

2. Apply the protected branch hard stop before staging or committing.
3. Run the secret redaction protocol before printing diff details.
4. Build and show the Commit Scope Ledger.
5. Stop or ask when:
   - no staged, unstaged, or untracked changes exist;
   - changes span unrelated concerns;
   - suspected secrets are present;
   - generated mirrors are stale;
   - feature readiness has not passed through `sdcorejs-ship` for the current `HEAD` or diff and has not been explicitly deferred;
   - `.sdcorejs/documentation/**` changed but is outside the requested feature commit scope.
6. Stage only explicit included paths when staging is needed.
7. Infer Conventional Commit type from included paths and change summary, not from excluded dirty files.
8. Use a scope when obvious from module, package, or skill name.
9. Commit with a heredoc for multi-line bodies.
10. Verify with `git status --short` and `git log -1 --stat`.

Conventional Commit format:

```text
<type>(<scope>): <imperative subject>
```

Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`, `ci`,
`build`, `style`, `revert`.

Scope hints:

- `skills/tracks/angular/` -> `angular`
- `skills/tracks/design/` -> `design`
- `skills/tracks/test/` -> `testing`
- `skills/shared/workflow/git.md` -> `git`
- `skills/shared/workflow/ship.md` -> `ship`
- `skills/shared/workflow/review.md` -> `review`
- `skills/shared/` -> `shared`
- `skills/orchestration/` -> `orchestration`
- `_refs/orchestration/` -> `orchestration`
- `.github/` -> `github`
- `.claude/` -> `claude`
- mixed concerns -> omit scope or use the smallest honest shared parent

Commit message bodies may include concise verification status:

```text
Verification: <pm> run test; <pm> run lint
Verification: deferred by user
Verification: not applicable, docs-only change
```

Do not claim tests passed unless they actually ran and passed. Do not include
secret values or huge generated summaries.

## Mode: pr

PR mode must use explicit base and range commands.

Required flow:

1. Run `command -v gh`.
2. Run `gh auth status`.
3. If `gh` is missing or unauthenticated, do not attempt `gh repo view` or `gh pr create`; generate a local PR title/body draft and stop with manual instructions.
4. Run `git branch --show-current`.
5. Apply the protected branch hard stop.
6. Run `git status --short`; require a clean tree unless the user explicitly asked for draft/manual PR instructions only.
7. Require current verify-before-done and branch-ready evidence unless docs-only or explicitly deferred.
8. Resolve the default branch explicitly:

```bash
BASE=$(gh repo view --json defaultBranchRef -q .defaultBranchRef.name)
git fetch origin "$BASE" --quiet
git log --no-merges "origin/$BASE..HEAD" --pretty=format:'%h %s'
git diff --stat "origin/$BASE...HEAD"
git diff --name-status "origin/$BASE...HEAD"
```

9. Stop if the branch has zero commits ahead of `origin/$BASE`.
10. Stop or explain if `BASE` cannot be resolved.
11. Detect existing PRs for the current branch before creating a new one:

```bash
gh pr view --json number,url,title,baseRefName,headRefName
gh pr list --head "$(git branch --show-current)" --json number,url,title,baseRefName,headRefName
```

12. If an existing PR exists, ask:
    `1. Update existing PR body` / `2. Create a new PR only if the platform allows and user confirms` / `3. Stop`.
13. Push only the current branch if needed, using the explicit branch name.
14. Create or update the PR only after confirmation when there is an existing PR or ambiguity.

Never use unqualified two-dot or three-dot HEAD ranges in PR mode. Bind PR
commit and diff ranges to `origin/$BASE..HEAD` and `origin/$BASE...HEAD`.

PR body requirements:

- Include a summary derived from `origin/$BASE...HEAD`.
- Include change bullets from diff name/status or stat, not full diffs.
- Include verification evidence from `sdcorejs-ship`, branch-ready, docs-only rationale, or deferred verification warning.
- Include review/repair evidence when the PR came from a review/repair loop.
- Include risk and rollback notes when meaningful.
- Do not paste full diffs.
- Do not paste secret values or raw suspicious lines.
- If verification was deferred, mark the PR as unverified or draft and state the risk.

Suggested PR body sections:

- Summary
- Changes
- Verification
- Review/Repair evidence, if applicable
- Risks and rollback
- Notes for reviewer

## Push Safety

If pushing is part of PR or delivery:

- Never force push.
- Never push protected branches directly.
- Push only the current branch.
- Use the explicit branch name.
- If upstream is missing, set upstream only after confirming branch name and remote.
- If remote is missing, stop and provide a local commit summary.
- If push fails due to non-fast-forward or permissions, stop; do not retry with force.
- Do not push if the working tree is dirty unless the operation is explicitly PR-body-only and no source commit is expected.

## Mode: changelog

Read `_refs/orchestration/release-changelog.md` completely, then generate or
update release notes:

- inspect `git status --short` before writing;
- avoid mixing changelog edits with unrelated dirty source changes;
- locate the baseline from explicit user range, latest tag, latest `CHANGELOG.md` entry, or explicit base branch;
- read the real commit range with `git log --no-merges`;
- redact suspected secrets from commit bodies or diff-derived notes;
- classify Conventional Commits into Keep a Changelog sections;
- suggest the semver bump and explain the reason in chat;
- ask before creating a missing `CHANGELOG.md` or writing a versioned release entry;
- surface untyped commits, breaking changes, and security-adjacent fixes for human review.

Do not tag, push tags, bump versions, create GitHub releases, or create release
artifacts beyond changelog/release-note files unless the user
explicitly requested and approved that release operation after verification.

## Release/Tag Safety

If release or tag behavior is mentioned:

- Do not create tags by default.
- Do not push tags by default.
- Do not bump versions by default.
- Do not create GitHub releases by default.
- Delegate release readiness to `sdcorejs-ship` or a dedicated release workflow when present.
- Only create release/tag artifacts after explicit user approval and clean verification evidence.

## Rules

### MUST DO

- Choose and state the mode before acting.
- Apply the mode precedence guard before artifact creation.
- Run current commands and read their output before claiming pass, fixed, built, ready, or done.
- Hard-stop protected branches for commit, PR, and push.
- Show the Commit Scope Ledger before staging or commit.
- Use explicit path staging only.
- Use heredocs for commit and PR bodies.
- Redact suspected secrets before printing evidence.
- Match the user's language for explanation; keep commands, branches, scopes, URLs, and env keys exact.

### MUST NOT

- Force-push.
- Commit, PR, or push directly from a protected branch.
- Offer any "continue on protected branch" path.
- Sweep unrelated files into a commit.
- Use dot-all or all-index staging shortcuts.
- Bypass `sdcorejs-ship` when the user asks whether work is ready.
- Tag, push tags, bump versions, or create releases without explicit approval.
- Edit source files from commit, PR, or workspace mode.
- Print raw secret-bearing lines.

## Cross-References

- `sdcorejs-ship` - final gate, verify-before-done, branch readiness, release readiness
- `_refs/orchestration/workspace-isolation.md` - workspace/worktree isolation reference
- `_refs/orchestration/tail/branch-ready.md` - branch hygiene checklist
- `_refs/orchestration/release-changelog.md` - release notes and CHANGELOG workflow
