# Workspace Isolation

Reference body for `sdcorejs-git` workspace mode and
`sdcorejs-parallel-dispatch` fan-out preparation. Load this file only when work
needs an isolated checkout or the user explicitly asks for a worktree.

## Purpose

Generation should not surprise the user's current branch. Isolation is useful
when work is risky, long-running, parallel, or explicitly requested by the user.

## When To Run

- Before parallel code-writing fan-out.
- Before execute-plan or a track executor when the user says "worktree",
  "separate branch", "do not touch current branch", or equivalent.
- Before risky generation when the parent skill decides isolation is needed.

Skip isolation when the user explicitly wants to work in place.

## Procedure

1. Detect the current Git state:

```bash
git rev-parse --show-toplevel
git rev-parse --git-dir
git rev-parse --git-common-dir
git rev-parse --show-superproject-working-tree
git branch --show-current
```

2. If `git-dir` differs from `git-common-dir` and this is not a submodule, treat
   the checkout as already isolated. Do not create a nested worktree.
3. Ask consent before creating a worktree unless the user already requested one.
   Use `_refs/shared/user-choice-prompt.md` and present:
   `1. Create worktree` / `2. Work in current checkout`.
4. Prefer a native harness worktree feature when available. Use manual
   `git worktree` only when no native tool is available.
5. For `git worktree` fallback:
   - prefer the user-specified directory
   - otherwise use `.worktrees/` when present, then `worktrees/`, then
     `.worktrees/`
   - confirm the directory is git-ignored before creation
   - create a branch name following the repo's branch convention
6. Run setup and a clean baseline in the isolated checkout:
   - Angular: `npm run build-dev` or a focused non-watch test
   - NestJS: `npm run build` then `npm run test`
   - Next.js: `npm run build` or `npm run lint`
   - Unknown stack: run only commands listed in the approved plan

## Report

Return:

- workspace path
- branch name
- whether isolation was reused, created, or skipped
- baseline command and result
- any blocker requiring user decision

## Rules

- Do not nest worktrees.
- Do not treat a submodule as a linked worktree.
- Do not use manual `git worktree` when the harness provides native isolation.
- Do not commit worktree contents.
- Do not proceed past a failing baseline without telling the user.
