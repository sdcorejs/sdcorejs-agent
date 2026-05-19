---
name: sdcorejs-branch-ready
description: Use AFTER `orchestration/verify-before-done` confirms acceptance criteria pass, BEFORE handing off to `sdcorejs-commit` / `sdcorejs-pr-create`. Inspired by `superpowers:finishing-a-development-branch`. Runs a branch-hygiene sweep — uncommitted noise, debug logs, focused tests (`.only`/`.skip`), commented-out code blocks, hardcoded secrets, large/binary surprises, and a final lint+test+build pass. Outputs a Ready / Blockers report. Does NOT modify code; surfaces issues and lets the user decide. Triggers - automatic in the tail-call chain after `verify-before-done`; or user says "branch xong chưa", "ready to ship", "kiểm tra branch", "check before commit", "final gate". Applies to angular-portal, nestjs, nextjs. Bilingual (VI/EN).
allowed-tools: Bash, Read, Grep, Glob
---

# Branch Ready — Hygiene Gate Before Commit/PR

## Purpose
Acceptance criteria passing (the `verify-before-done` job) doesn't mean the branch is ready to ship. Debug logs left in, a `.only` on a test, commented-out experiments, a stray `.env` — these all pass acceptance criteria but leak into PRs and embarrass on review. This skill is the last sanity sweep before `sdcorejs-commit`.

It does NOT modify code. It surfaces issues so the user decides — fix in place, ignore, or defer.

## When invoked
- **Automatic**: in the SDLC tail-call chain, right after `orchestration/verify-before-done` returns ✅ and before `sdcorejs-commit`
- **Manual**: user says "branch xong chưa", "ready to ship", "kiểm tra branch", "check before commit", "final gate", "branch hygiene"

Do NOT invoke for:
- Mid-work checks (the noise is intentional then; this is a SHIP-time gate)
- Branches with intentional WIP commits (squash strategy in play; checks still useful but not blocking)

## Checks

Run all in parallel where possible (read-only commands), then aggregate. Each check has a severity:
- 🔴 **Blocker** — must resolve before shipping
- 🟡 **Warning** — surfacing for awareness; user decides
- ⚪ **Info** — context the user might want

### 1. Uncommitted changes 🔴
```bash
git status --porcelain
```
- If non-empty → list each file with status (`M`, `??`, `D`). Blocker unless every file is intentionally untracked (e.g. `.env.local`, build artifacts).

### 2. Debug logs and focused tests 🔴
On STAGED + UNCOMMITTED files only (not the whole repo — too noisy):
```bash
git diff --cached --name-only | xargs grep -nE "console\.(log|debug|info|warn)\b" 2>/dev/null
git diff --cached --name-only | xargs grep -nE "\bdebugger\b" 2>/dev/null
git diff --cached --name-only | xargs grep -nE "\.only\(|\.skip\(|fdescribe\(|fit\(|xdescribe\(|xit\(" 2>/dev/null
```
- `console.log` / `console.debug` → Blocker (use a real logger or remove)
- `console.warn` / `console.error` → Warning (often intentional)
- `debugger` → Blocker
- `.only(`, `fdescribe(`, `fit(` → Blocker (test won't run the others in CI)
- `.skip(`, `xdescribe(`, `xit(` → Warning (skipped test = hidden debt)

### 3. Commented-out code blocks 🟡
```bash
git diff --cached -U0 | grep -E "^\+\s*//\s*[A-Za-z<{(]" | head -20
```
Heuristic: `+` lines whose first non-whitespace is `// <code-like-token>`. Catches `// const foo = ...`, `// import { ... }`, `// <Component .../>`. Not perfect — license headers and section dividers may trigger. Warning only; user judges.

### 4. Secrets and credentials 🔴
On STAGED files:
```bash
git diff --cached --name-only | grep -vE "\.(example|md)$" | xargs grep -nE "(API_KEY|SECRET|PASSWORD|TOKEN|PRIVATE_KEY)\s*=\s*[\"'][^\"']{8,}" 2>/dev/null
```
ANY match → Blocker. Check user pushed by accident.

Additionally check that the staged changes don't include:
- `.env` (without `.example` suffix) — Blocker
- `*.pem`, `*.key`, `id_rsa*` — Blocker
- `credentials.json`, `service-account*.json` — Blocker

### 5. Large or binary files 🟡
```bash
git diff --cached --stat | awk '$3 ~ /^[0-9]+/ && $3+0 > 500 { print }'
git diff --cached --name-only | xargs file 2>/dev/null | grep -Ei "(binary|executable|image data)" | grep -v "^.*: SVG\b"
```
Files >500 lines added → Warning (might be a generated lockfile / data dump, surface to user).
Binaries other than SVG/PNG/JPG that user explicitly added → Warning.

### 6. Lint + typecheck + test pass 🔴
Track-specific commands. Detect track first.

**Angular:**
```bash
npm run lint && npm run build && npm run test -- --watch=false
```
**NestJS:**
```bash
npm run lint && npm run build && npm run test && npm run test:e2e
```
**Next.js:**
```bash
npm run lint && npm run build && npm run typecheck 2>/dev/null
# (typecheck only if defined in package.json)
```

Any non-zero exit → Blocker.

If the project doesn't have `lint` / `test` scripts, skip silently (don't fail just because a script isn't defined — the project might rely on CI for that).

### 7. Branch state vs main 🟡
```bash
MAIN=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's|refs/remotes/origin/||' || echo main)
git log --oneline "$MAIN"..HEAD 2>/dev/null | wc -l
```
- 0 commits ahead → Warning ("Branch hasn't diverged from $MAIN — nothing to ship")
- >20 commits ahead → Warning ("Large branch. Consider splitting into multiple PRs.")

Also:
```bash
git fetch --quiet
git rev-list --count HEAD..origin/HEAD 2>/dev/null
```
- If remote has commits the local branch doesn't → Info ("Remote is N commits ahead — rebase first?")

### 8. Conflicts and rebase markers 🔴
```bash
git diff --cached | grep -E "^[+-]<<<<<<<|^[+-]=======|^[+-]>>>>>>>" | head
```
Any match → Blocker. Conflict markers shipped to commit is the worst outcome.

### 9. `.sdcorejs/` artifacts present 🟡
For tracks with auto-docs:
```bash
ls .sdcorejs/docs/<track>/*.md 2>/dev/null | head -3
```
If the feature is non-trivial (>2 file changes) but no fresh doc exists for it → Warning ("Auto-docs didn't run after the latest task — consider running `sdcorejs-auto-docs`").

This is a soft check — not all branches need a doc. But it's a useful nudge.

## Output format

Match user's language. Output one block:

```markdown
## Branch ready check — `<branch-name>`

### 🔴 Blockers (N)
- [check name] file:line — what was found — suggested fix
- ...

### 🟡 Warnings (M)
- [check name] file:line — what was found — user decides
- ...

### ⚪ Info (K)
- [check name] — context

### Summary
- Files changed: N (staged) + M (unstaged)
- Tests: passed / failed / skipped
- Lint: ✓ / ✗ (N issues)
- Build: ✓ / ✗
- Commits ahead of <main>: N

### Verdict
**🟢 READY** — all blockers clear; lint/build/test pass.
  → Hand off to `sdcorejs-commit` next.

OR

**🔴 BLOCKED** — fix blockers above and re-run.

OR

**🟡 READY WITH WARNINGS** — blockers clear but N warnings; user acknowledged via "tôi biết, ship đi" or similar.
  → Hand off to `sdcorejs-commit`.
```

## Edge cases

### CI-only project
Some projects rely entirely on CI for lint+test. If `npm run lint` / `npm run test` aren't defined, skip those checks but note in Summary: "No lint/test scripts in package.json — relying on CI."

### Pre-merge vs pre-commit
This skill runs at the PRE-COMMIT boundary. For PR-time checks (after CI), use `sdcorejs-pr-create` which has its own gate.

### Multiple tracks in monorepo
If the target repo has multiple stacks (e.g. apps/angular + apps/nestjs), run track-specific commands for the track that changed (detect from `git diff --cached --name-only` paths). If both changed, run both.

### Worktrees
If `git worktree list` shows multiple worktrees on the same branch, surface as Info — the user might be doing parallel work.

## Rules

### MUST DO
- Run ALL read-only checks before reporting (don't bail early — user wants the full picture)
- Distinguish Blocker / Warning / Info clearly
- Match user's language
- Suggest the next skill (`sdcorejs-commit` / `sdcorejs-pr-create`) when verdict is READY
- Run track-specific lint/test (detect via package.json)

### MUST NOT
- Modify files. This is a READ-ONLY gate.
- Run destructive git commands (rebase, reset, clean — even if "obviously" what the user wants)
- Bypass a Blocker on user request without an explicit acknowledgement message ("tôi biết, ship đi" / "I know, ship anyway")
- Run `npm install` to silence "module not found" — that's an env-setup issue, surface it instead
- Run `git fetch --tags` or other heavy network ops in remote checks — `git fetch --quiet` is enough

## Anti-patterns
- Gate that always says "READY" — pointless, defeats the purpose
- Gate that blocks on every Minor lint warning — noisy; only block on test/build failures and on critical content (secrets, conflict markers)
- Running this BEFORE `verify-before-done` — wrong order; acceptance comes first
- Modifying files to "fix" warnings before reporting — the user should decide
- Bypassing all blockers silently when the user says "commit luôn" — explicit acknowledgement required

## Cross-references
- `orchestration/verify-before-done` — runs before; acceptance-criteria gate
- `sdcorejs-commit` — runs after when READY; uses Conventional Commits
- `sdcorejs-pr-create` — runs after `sdcorejs-commit` when shipping
- `shared/workflow/debug` — if a blocker is a failing test you don't understand
- `superpowers:finishing-a-development-branch` — the source-of-inspiration; their version is more general (different ecosystem), this one is SDCoreJS-tailored
