---
name: sdcorejs-ship
description: End-to-end ship orchestrator. Chains verify-before-done → branch-ready → [changelog if release mode] → commit → push → pr-create into a single entry point. Triggers - "ship", "ship branch này", "đẩy lên", "release", "xong rồi ship đi", "ready to merge". Applies to angular, nestjs, nextjs and the sdcorejs-agent repo. Bilingual (VI/EN).
allowed-tools: Bash, Read
---

# Ship — End-to-End Ship Orchestrator

## Purpose
`verify-before-done`, `branch-ready`, `commit`, and `pr-create` each exist as standalone
skills for independent use. For the common "I'm done, ship it" case this orchestrator
chains them so the user says one thing and the full gate sequence runs.

## When invoked
- "ship", "ship branch này", "ship đi", "đẩy lên"
- "ready to merge", "xong rồi ship đi"
- "release", "tag and release"

> `"tạo PR"` / `"mở PR"` (PR-only, no full ship sequence) → `sdcorejs-pr-create`, which owns that phrase.

Do NOT invoke if:
- Work is mid-feature (incomplete) — use sub-skills directly
- User wants commit-only without PR — invoke `sdcorejs-commit` directly
- User wants a review first — invoke `sdcorejs-review` first

## Workflow

### Step 0 — Pre-flight (read-only, run upfront)

```bash
git rev-parse --abbrev-ref HEAD
git status --porcelain
MAIN=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null \
  | sed 's|refs/remotes/origin/||' || echo main)
git log "$MAIN"..HEAD --oneline 2>/dev/null | wc -l
```

**Hard stops:**
- Branch is `main` / `master` / `release/*` →
  "Đang ở protected branch. Tạo feature branch trước rồi ship."
- Zero commits ahead of main →
  "Không có commit nào để ship."
- Uncommitted changes remain →
  "Còn thay đổi chưa commit. (a) commit vào branch trước khi ship, hay (b) stash?"

### Step 1 — Detect ship mode

Auto-detect from user phrasing; otherwise ask:
> "Ship mode: (a) Feature PR — mở PR, không tag; (b) Release — tạo CHANGELOG + tag?"

- User said "release" / "tag" / "version bump" → **Release mode**
- Otherwise → **Feature PR mode**

### Step 2 — Run `sdcorejs-verify-before-done`

Invoke `sdcorejs-verify-before-done`.

- 🟢 DONE → continue
- 🟡 criteria deferred by user → continue (deferred list noted in summary)
- 🔴 unresolved blockers → STOP until user resolves or says
  "ship với issues đã biết"

### Step 3 — Run `sdcorejs-branch-ready`

Invoke `sdcorejs-branch-ready`.

- 🟢 READY → continue
- 🟡 READY WITH WARNINGS (user acknowledged) → continue
- 🔴 BLOCKED → STOP until blockers resolved

### Step 4 — [Release mode only] Changelog

Invoke `sdcorejs-changelog`.

After generating the entry, ask:
> "CHANGELOG drafted. Semver bump: PATCH / MINOR / MAJOR — confirm trước khi ghi vào
> file không?"

Wait for confirmation before writing. If user declines → skip, note in summary.

### Step 5 — Commit (if tree is dirty)

```bash
git status --porcelain
```

If non-empty: invoke `sdcorejs-commit`.
If tree is already clean: skip silently.

### Step 6 — Push

```bash
# First push (branch not yet on remote):
git push -u origin HEAD

# If branch already tracks remote:
git push
```
- NEVER force-push to a shared branch
- If rejected (non-fast-forward): "Remote có commits mới hơn. Rebase trước:
  `git pull --rebase` rồi chạy lại ship."

### Step 7 — PR

Invoke `sdcorejs-pr-create`.

### Step 8 — Summary

```
## Ship complete — `<branch>`

- verify-before-done : ✅ N criteria / ⚠️ N deferred
- branch-ready       : ✅ / ⚠️ N warnings acknowledged
- changelog          : ✅ vX.Y.Z / — (feature PR mode)
- commit             : ✅ <hash> / — (tree was clean)
- push               : ✅
- PR                 : <url>
```

If the user overrides a 🔴 stop ("ship với issues đã biết"), prefix the
affected gate line with `⚠️ shipped with known issues:`:

  - verify-before-done : ⚠️ shipped with known issues (N unresolved criteria)

## Rules

### MUST DO
- Run all gates in order — never skip `verify-before-done` or `branch-ready`
- Detect ship mode before step 4
- Hard-stop on protected branches and zero-commits-ahead
- Surface each gate's result to the user before proceeding
- Ask before writing to CHANGELOG.md

### MUST NOT
- Auto-bump `package.json` version — user confirms inside `sdcorejs-changelog`
- Create PR with uncommitted changes in the tree
- Skip changelog generation in release mode
- Force-push under any circumstances
- Invoke ship on `main` / `master` / `release/*`

## Anti-patterns
- "Tests were passing 10 minutes ago, skip verify" — always re-run at ship time; cheap
  to re-check, expensive to ship broken
- Running ship mid-feature because "it's mostly done" — finish the work first
- Opening the PR before branch-ready resolves all blockers

## Cross-references
- `sdcorejs-verify-before-done` — Step 2 (acceptance criteria gate)
- `sdcorejs-branch-ready` — Step 3 (hygiene gate)
- `sdcorejs-changelog` — Step 4 (release mode only)
- `sdcorejs-commit` — Step 5
- `sdcorejs-pr-create` — Step 7

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
