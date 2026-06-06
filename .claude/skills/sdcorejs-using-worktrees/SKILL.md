---
name: sdcorejs-using-worktrees
description: Use to set up an ISOLATED workspace before write-code or parallel dispatch — detects existing isolation, prefers a native worktree tool, falls back to `git worktree`, then runs per-stack setup + a clean baseline. Protects the user's current branch from in-progress generation and lets `sdcorejs-subagent-driven-dev` fan out agents that don't trample each other. Triggers - "tạo worktree", "worktree", "isolate workspace", "làm trên nhánh riêng", "không đụng nhánh hiện tại", "chạy song song nhiều feature", or automatic before `<track>-write-code` when work needs isolation. Applies to angular, nestjs, nextjs. Bilingual (VI/EN).
allowed-tools: Read, Bash, Glob
---

# Using Worktrees (Cross-Track)

## Purpose
Generation should not happen on top of the user's live branch. An isolated workspace keeps the working branch clean, makes a botched generation trivial to discard, and is the precondition for `sdcorejs-subagent-driven-dev` fanning out parallel agents that each own a directory. This skill ensures isolation exists before any code is written.

**Core principle:** detect existing isolation first → use the platform's native worktree tool → fall back to `git worktree` → never fight the harness.

**Announce at start:** "Using `sdcorejs-using-worktrees` to set up an isolated workspace."

## When to use
- Before `<track>-write-code` when the user wants the current branch protected
- Before `sdcorejs-parallel-dispatch` / `sdcorejs-subagent-driven-dev` fan-out (each unit needs its own directory)
- User says "worktree", "làm trên nhánh riêng", "đừng đụng nhánh hiện tại", "chạy song song"

If the user explicitly wants to work in place, honor that and skip to Step 3.

## Step 0 — Detect existing isolation
Before creating anything, check whether you are already in an isolated workspace.

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

**Submodule guard:** `GIT_DIR != GIT_COMMON` is also true inside a git submodule. Before concluding "already in a worktree", verify you are not in a submodule:

```bash
# If this prints a path, you're in a submodule — treat as a normal repo.
git rev-parse --show-superproject-working-tree 2>/dev/null
```

- **`GIT_DIR != GIT_COMMON` (and not a submodule):** already in a linked worktree. Skip to Step 3. Do NOT nest another worktree.
  - On a branch → "Already isolated at `<path>` on branch `<name>`."
  - Detached HEAD → "Already isolated at `<path>` (detached HEAD, externally managed). Branch creation needed at finish time."
- **`GIT_DIR == GIT_COMMON` (or in a submodule):** normal checkout. If the user hasn't already stated a worktree preference, ask consent:
  > "Tạo worktree riêng để cô lập công việc không? Nó bảo vệ nhánh hiện tại khỏi thay đổi. / Set up an isolated worktree? It protects your current branch."

  Honor any declared preference without re-asking. If declined, work in place → Step 3.

## Step 1 — Create the isolated workspace
Two mechanisms, tried in this order.

### 1a. Native worktree tool (preferred)
If the harness exposes a native tool — `EnterWorktree`, a `/worktree` command, a `--worktree` flag — use it and skip to Step 3. Native tools handle directory placement, branch creation, and cleanup. Using `git worktree add` when a native tool exists creates phantom state the harness can't manage. **This is the #1 mistake — if you have a native tool, use it.**

### 1b. Git worktree fallback
Only if no native tool is available.

**Directory selection** (explicit user preference always wins over filesystem state):
1. A worktree directory the user declared in their instructions → use it.
2. Existing project-local dir: prefer `.worktrees/`, else `worktrees/` (if both exist, `.worktrees/` wins).
3. Otherwise default to `.worktrees/` at the repo root.

**Safety — project-local dirs MUST be git-ignored before creating the worktree:**
```bash
git check-ignore -q .worktrees 2>/dev/null || git check-ignore -q worktrees 2>/dev/null
```
If NOT ignored: add the dir to `.gitignore`, commit that change, then proceed. (Prevents committing worktree contents into the repo.)

**Create:**
```bash
git worktree add ".worktrees/$BRANCH_NAME" -b "$BRANCH_NAME"
cd ".worktrees/$BRANCH_NAME"
```

**Sandbox fallback:** if `git worktree add` fails with a permission/sandbox error, tell the user the sandbox blocked it and you're working in place instead, then continue at Step 3.

## Step 2 — Branch naming
Follow the repo's convention (check recent branches with `git branch -a | head`). Default to Conventional-Commit-aligned prefixes matching `sdcorejs-commit`:
- `feat/<module>-<short-topic>` for new features
- `fix/<module>-<short-topic>` for bug fixes
- `chore/<topic>` for tooling/docs

## Step 3 — Per-stack setup
Auto-detect the stack and install dependencies. All three sdcorejs stacks are npm-based:

```bash
if [ -f package.json ]; then npm install; fi
```

If the target is a monorepo with workspaces (common for Angular Portal libs), `npm install` at the root is enough; do not descend into each lib.

## Step 4 — Verify clean baseline
Run the stack-appropriate baseline so later failures are attributable to your changes, not pre-existing breakage:

| Stack | Baseline command |
|---|---|
| angular | `npm run build-dev` (or `npm run test -- --watch=false` if a quick suite exists) |
| nestjs | `npm run build` then `npm run test` |
| nextjs | `npm run build` (or `npm run lint` for a faster signal) |

- **Baseline fails:** report the failures and ask whether to proceed or investigate first — do not silently build on a broken tree.
- **Baseline passes:** report ready.

### Report
```
Worktree ready at <full-path> on branch <name>
Baseline: <command> passed (<summary>)
Ready to run <track>-write-code for <feature>
```

## Quick reference
| Situation | Action |
|---|---|
| Already in linked worktree | Skip creation (Step 0) |
| In a submodule | Treat as normal repo (Step 0 guard) |
| Native worktree tool available | Use it (Step 1a) |
| No native tool | `git worktree` fallback (Step 1b) |
| `.worktrees/` + `worktrees/` both exist | Use `.worktrees/` |
| Dir not git-ignored | Add to `.gitignore` + commit, then create |
| Permission/sandbox error on create | Work in place, tell the user |
| Baseline fails | Report + ask before proceeding |

## Rules

### MUST DO
- Run Step 0 detection before creating anything
- Prefer a native worktree tool over `git worktree`
- Verify project-local worktree dirs are git-ignored before creating
- Run per-stack setup + a clean baseline before handing off to write-code
- Ask consent before creating a worktree unless the user already declared a preference

### MUST NOT
- Nest a worktree inside an existing linked worktree
- Use `git worktree add` when a native tool is available
- Commit worktree contents (always confirm the dir is ignored)
- Proceed past a failing baseline without telling the user
- Treat a submodule as a worktree

## Anti-patterns
- Fighting the harness: manual `git worktree` when native isolation exists → phantom state
- Skipping baseline → can't tell new breakage from pre-existing
- Hardcoding a directory that violates the repo's existing `.worktrees/` convention

## Cross-references
- `sdcorejs-parallel-dispatch` — decides WHETHER to fan out; this skill gives each unit a clean directory
- `sdcorejs-subagent-driven-dev` — execution discipline once fan-out is decided; relies on per-agent isolation
- `sdcorejs-branch-ready` — end-of-feature hygiene sweep before the branch is finished
- `sdcorejs-commit` — branch-naming + commit conventions referenced in Step 2

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
