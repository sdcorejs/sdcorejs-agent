---
name: sdcorejs-git
description: Git artifact workflow. Use for commit/save changes, create PR, push verified branch, changelog, release notes, diff since tag, PR text, or executor worktree isolation. Do not use for readiness/ship gates; use sdcorejs-ship first, then this for commit/PR/changelog artifacts. Applies to all tracks and this repo. Runtime-localized.
allowed-tools: Bash, Read, Grep, Glob, Write, Edit
---

# Git

## Purpose
One skill for Git artifacts:

- isolate risky or parallel work from the user's current branch
- create a Conventional Commit
- open a pull request
- write release notes / CHANGELOG entries

Readiness and final delivery gates live in `sdcorejs-ship`.

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
| `workspace` | "worktree", "isolate workspace", "do not touch current branch", "run in parallel" | isolated workspace decision + baseline result |
| `commit` | "commit", "commit changes", "save changes" | one Conventional Commit |
| `pr` | "create PR", "open PR", "gh pr create" | pushed branch + PR URL |
| `changelog` | "write changelog", "update CHANGELOG", "release notes", "what changed since vX.Y.Z" | Keep a Changelog entry + semver recommendation |

If multiple modes match, choose the narrowest explicit request:
`commit`, `pr`, and `changelog` are all narrower than `sdcorejs-ship`.

## Shared Pre-Flight

Run relevant read-only checks first:

```bash
git rev-parse --abbrev-ref HEAD
git status --porcelain
git remote -v
```

Never force-push. Never commit secrets. Never stage unrelated work.

Documentation preferences are project artifacts. When a commit/PR includes work
that used or changed saved documentation settings, include
`.sdcorejs/documentation/**` with the same feature change unless the user
explicitly asks for a separate commit. Do not treat these files as disposable
session state.

## Mode: workspace

Read `_refs/orchestration/workspace-isolation.md` completely, then follow it to:

- detect whether the current checkout is already isolated
- ask consent before creating a worktree unless the user already requested one
- prefer a native harness worktree feature when available
- fall back to `git worktree` only when safe
- run the per-stack setup and baseline command before handing off to execution

This mode is mostly called by `sdcorejs-execute-plan` or
`sdcorejs-parallel-dispatch`. When invoked directly, report the chosen workspace,
branch, baseline command, and blockers.

## Mode: commit

1. Inspect:

```bash
git status --porcelain
git diff --stat
git diff --staged --stat
git log -5 --oneline
```

2. Stop or ask when:
   - branch is `main`, `master`, or `release/*`
   - no staged or unstaged changes exist
   - changes span unrelated concerns
   - diff may contain secrets (`password=`, `token=`, `.env`, private key markers)
   - generated mirrors are stale; run sync/check first
   - feature readiness has not passed through `sdcorejs-ship` in this turn or been explicitly deferred
   - `.sdcorejs/documentation/**` changed but is not included in the requested commit scope for the feature that used it
3. Stage only explicit paths when the user asked you to stage. Never `git add .`
   or `git add -A`.
4. Compose Conventional Commits:

```text
<type>(<scope>): <imperative subject>
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `build`, `ci`,
`perf`, `style`, `revert`.

Scope hints:

- `skills/tracks/angular/` -> `angular`
- `skills/tracks/design/` -> `design`
- `skills/tracks/test/` -> `testing`
- `skills/shared/workflow/review.md` -> `review`
- `skills/shared/` -> `shared`
- `skills/orchestration/` -> `orchestration`
- `.github/` -> `github`
- `.claude/` -> `claude`
- mixed concerns -> omit scope or use the smallest honest shared parent

5. Commit with a heredoc for multi-line bodies.
6. Verify with `git status` and `git log -1 --stat`.

## Mode: pr

1. Refuse PR creation on `main` / `master`.
2. Require a clean working tree.
3. Require current acceptance + branch-ready evidence for feature PRs.
4. Resolve base branch:

```bash
gh repo view --json defaultBranchRef -q .defaultBranchRef.name
git log <base>..HEAD --pretty=format:'%h %s%n%b%n---'
git diff <base>...HEAD --stat
git diff <base>...HEAD
```

5. If `gh` is not authenticated, tell the user to run `gh auth login` and stop.
6. Compose:
   - title: Conventional-Commit style when possible, <=70 chars
   - body: Summary, Changes, Test plan, optional Out of scope, optional Refs
7. Push the branch if needed with `git push -u origin HEAD`.
8. If a PR already exists, ask before editing or creating another using
   `_refs/shared/user-choice-prompt.md`: `1. Edit existing PR` /
   `2. Create separate PR` / `3. Stop`.
9. Create the PR with a heredoc body and return the URL.

## Mode: changelog

Read `_refs/orchestration/release-changelog.md` completely, then generate or
update release notes:

- locate the baseline from the latest tag, latest `CHANGELOG.md` entry, or a
  user-supplied SHA/date
- read the real commit range with `git log --no-merges`
- classify Conventional Commits into Keep a Changelog sections
- suggest the semver bump and explain the reason in chat
- ask before creating a missing `CHANGELOG.md` or writing a versioned release
  entry
- surface untyped commits, breaking changes, and security-adjacent fixes for
  human review

Do not tag, push, or bump package versions from this mode without explicit user
approval.

## Rules

### MUST DO
- Choose and state the mode before acting.
- Run current commands and read their output before claiming pass/fixed/done.
- Use explicit staging paths.
- Use heredocs for commit and PR bodies.
- Match the user's language for explanation; keep commands, branches, scopes,
  URLs, and env keys exact.

### MUST NOT
- Force-push.
- Commit or PR directly from `main` / `master`.
- Sweep unrelated files into a commit.
- Bypass `sdcorejs-ship` when the user asks whether work is ready.
- Tag, push, or bump package versions without explicit approval.

## Cross-References
- `sdcorejs-ship` - final gate, verify-before-done, branch readiness, release readiness
- `_refs/orchestration/workspace-isolation.md` - workspace/worktree isolation reference
- `_refs/orchestration/release-changelog.md` - release notes and CHANGELOG workflow
