# Workspace Isolation

## Contents

- [Purpose](#purpose)
- [When To Run](#when-to-run)
- [Procedure](#procedure)
- [Report](#report)
- [Rules](#rules)

Canonical owner of the provider-neutral `workspace.isolate` action. Load it
from `sdcorejs-execute-plan`, `sdcorejs-subagent-driven-development`, or
`sdcorejs-parallel-dispatch` when work needs an isolated checkout or the user
explicitly asks for a worktree. `sdcorejs-git` may consume the resulting
workspace identity later, but it does not create executor workspaces.

## Purpose

Generation should not surprise the user's current branch. Isolation is useful
when work is risky, long-running, parallel, or explicitly requested by the user.

The isolation action creates or selects a safe workspace only. It must not edit source
files, commit, push, delete branches, or delete worktrees.

For parallel protocol v2, the action returns identity rather than a vague
global isolation choice. Each unit records strategy, resolved path, branch,
base HEAD, whether the current run created it, and its result protocol. The
integration workspace is separate from unit worktrees.

Live progress stays in each runtime task mechanism. Workspaces, branches,
approved plans, result identities, and `artifact_context` coordinate work;
repository session checkpoint files do not.

## When To Run

- Before parallel code-writing fan-out.
- Before execute-plan or a track executor when the user says "worktree", "separate branch", "do not touch current branch", or equivalent.
- Before risky generation when the parent skill decides isolation is needed.

Skip isolation when the user explicitly wants to work in place.

## Procedure

### 1. Detect Current Git State

```bash
git rev-parse --show-toplevel
git rev-parse --git-dir
git rev-parse --git-common-dir
git rev-parse --show-superproject-working-tree
git branch --show-current
git status --short
```

If `git-dir` differs from `git-common-dir` and this is not a submodule, treat
the checkout as already isolated. Do not create a nested worktree.

### 2. Confirm Isolation Choice

Ask consent before creating a worktree unless the user already requested one.
Use `_refs/shared/user-choice-prompt.md` and present:

1. Create worktree.
2. Work in current checkout.
3. Stop.

Prefer a native harness worktree feature when available. Use manual
`git worktree` only when no native tool is available.

### 3. Create Safe Branch And Worktree Names

For manual `git worktree` fallback:

- resolve the base branch explicitly;
- create branch names from safe task slugs;
- prefer the user-specified directory;
- otherwise use `.worktrees/` when present, then `worktrees/`, then `.worktrees/`;
- confirm the parent directory is git-ignored or outside tracked source;
- do not overwrite an existing directory;
- do not delete existing branches or worktrees unless explicitly requested and confirmed.

Record:

- base branch
- new branch name
- worktree path
- whether isolation was reused, created, or skipped
- resolved integration workspace path
- per-unit workspace path, branch, common base HEAD, and creation owner
- per-unit change-scoped artifact paths and integration ownership for every
  shared `.sdcorejs/**` artifact
- pre-existing worktrees that cleanup must preserve

Before returning a worktree assignment, verify that it is not nested inside
another worktree, that the base equals the approved baseline, and that distinct
units do not share a branch or path. A runtime without agent-specific cwd may
not receive write-heavy worktree assignments; return to parallel capability
fallback instead.

### 4. Discover Package Manager And Scripts

Discover commands from the target workspace, not from assumptions:

1. Read `package.json` when present.
2. Respect `packageManager` in `package.json` when present.
3. Otherwise infer from lockfiles:
   - `pnpm-lock.yaml` -> `pnpm`
   - `yarn.lock` -> `yarn`
   - `package-lock.json` or `npm-shrinkwrap.json` -> `npm`
   - `bun.lock` or `bun.lockb` -> `bun`
4. If multiple package-manager signals conflict, stop and ask before running install or baseline commands.
5. Do not mix package managers.
6. Read root and workspace package scripts when a monorepo is detectable.
7. Run only scripts that exist in the relevant `package.json`.
8. Do not invent missing script names.

### 5. Select Baseline Checks

Choose baseline checks from discovered scripts and changed stack signals:

- Prefer existing non-watch verification scripts with names such as `lint`, `typecheck`, `check`, `test`, `test:e2e`, `build`, `build:site`, or repo-documented equivalents.
- For monorepos, prefer workspace-level scripts that target the changed package/app when detectable.
- If an approved plan lists specific baseline commands, use those commands only when they exist and match the detected package manager.
- If no relevant script exists, record the skip with evidence, for example `skipped: no lint script found in package.json`.

Do not run package installation automatically unless the current workflow
explicitly approved setup. A missing dependency error is baseline evidence, not
a reason to install packages silently.

### 6. Distinguish Existing Baseline Failures

Run the selected baseline in the isolated checkout before task execution when
safe. Record failures as baseline state so later executors can distinguish:

- failures that existed before the task;
- failures introduced by the task;
- checks skipped because no script or package manager was available.

## Report

Return:

- workspace path
- base branch
- new branch name
- whether isolation was reused, created, or skipped
- package manager
- baseline commands discovered and run
- baseline commands skipped
- reason for each skip
- baseline failures existing before the task
- any blocker requiring user decision

## Rules

- Do not nest worktrees.
- Do not treat a submodule as a linked worktree.
- Do not use manual `git worktree` when the harness provides native isolation.
- Do not edit source files from the isolation action.
- Do not commit worktree contents.
- Do not push branches from the isolation action.
- Do not delete branches or worktrees without explicit request and confirmation.
- Cleanup may remove only a worktree whose resolved path and
  `created_by_current_run: true` record match the current protocol run. Never
  remove a pre-existing worktree.
- Do not proceed past a failing baseline without telling the user.
- Do not hardcode one package manager as universal.
- Do not invent missing scripts.
- Do not let workers update shared summary, persona, memory, or living backlog
  artifacts; assign those writes to the integration owner after fan-in.
- Do not use a session checkpoint file as a concurrency primitive.
