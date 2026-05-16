---
name: sdcorejs-commit
description: Use when the user asks to create a git commit, says "commit", "tạo commit", "ghi nhận thay đổi", or ends a code-writing task that should be committed. Generates a Conventional Commits message with auto-detected scope from staged paths, plus git-awareness checks (current branch, modified files, no force-push on main). Applies to angular-portal, nestjs, nextjs and the sdcorejs-agent repo itself.
allowed-tools: Bash, Read
---

# Commit — Conventional Commits + Scope Detection + Git Safety

## Purpose
Produce a clean, machine-parseable commit message that future tooling (changelog, semver bump, release notes) can consume. Catch unsafe states (main branch, mixed unrelated changes, secrets) before the commit lands.

## When invoked
- User says "commit", "tạo commit", "ghi nhận", "save changes"
- End of a code-writing skill when the change set is cohesive and the user has not asked to defer
- After fixing a review finding

Do NOT invoke if the user has not explicitly approved a commit OR if the changes span unrelated concerns (split first).

## Workflow

### 1. Pre-flight (parallel)
- `git status --porcelain` — see what would be committed
- `git rev-parse --abbrev-ref HEAD` — current branch
- `git diff --staged --stat` (if anything staged) OR `git diff --stat` to know change shape
- `git log -5 --oneline` — match recent style

### 2. Safety gates (STOP and ask if any fail)
- **Branch is `main` / `master` / `release/*`** → ask user to confirm or branch off
- **No staged files AND no unstaged changes** → nothing to commit, abort silently
- **Possible secrets in diff** — grep staged diff for `password\s*=`, `token\s*=`, `SECRET`, `private_key`, `BEGIN RSA`, `.env` content → warn before staging
- **Mixed concerns** — staged files touch >2 unrelated areas (e.g. `skills/angular-portal/` + `skills/nestjs/` + `.github/workflows/`) → suggest splitting
- **Generated files dirty** — `.claude/skills/**` differs from `bash .claude/sync-skills.sh` output → run sync + restage

### 3. Stage (only if user asked you to stage)
Prefer staging specific files by name. Never `git add -A` or `git add .` — those swallow secrets and unrelated junk.
```
git add path/one path/two
```

### 4. Compose the message

Format: `<type>(<scope>): <subject>`

**Type** (pick the most specific):
| Type | When |
|---|---|
| `feat` | new user-facing capability |
| `fix` | bug fix |
| `refactor` | code restructured, no behavior change |
| `docs` | docs only (README, skill bodies, comments) |
| `chore` | tooling, config, deps |
| `test` | tests added/changed only |
| `perf` | measurable perf improvement |
| `style` | formatting, whitespace, no logic |
| `ci` | CI/CD changes |
| `build` | build system / packaging |
| `revert` | reverts a previous commit |

**Scope detection** — derive from the most common top-level segment of staged paths:
- All paths under `skills/angular-portal/` → scope `angular-portal`
- All under `skills/_shared/` → scope `shared`
- All under `skills/angular-portal/_refs/sdcorejs-angular/` → scope `refs`
- All under `.github/` → scope `github`
- All under `.claude/` → scope `claude`
- All under `src/libs/<module>/` (target Angular project) → scope `<module>`
- All under `apps/<app>/` → scope `<app>`
- Mixed → omit scope OR use the highest-level shared parent

**Subject rules**:
- Imperative mood ("add", "fix", "remove" — not "added"/"adds")
- ≤72 chars
- Lowercase first letter unless proper noun
- No trailing period

**Body** (optional, blank line after subject):
- WHY, not WHAT (the diff already shows WHAT)
- Bullet list ok if 2+ distinct rationales
- Wrap at ~80 chars

**Footer** (optional):
- `BREAKING CHANGE: <description>` for breaking API/contract changes
- `Refs #123` to reference issues
- `Co-Authored-By: <name> <email>` when pairing or AI-assisted

### 5. Execute
Use a heredoc to preserve formatting:
```bash
git commit -m "$(cat <<'EOF'
feat(angular-portal): add 5 shared workflow skills

- commit, pr-create, debug, recovery, env-setup
- enforces sync-skills via lefthook pre-commit

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### 6. Verify
- `git status` — confirm clean tree (or expected unstaged residue)
- `git log -1 --stat` — confirm commit landed with the intended files

If pre-commit hook fails: investigate root cause, fix it, restage, create a NEW commit (do NOT `--amend` after a hook failure — the commit didn't happen, so amend would rewrite the PREVIOUS commit).

## Examples

### Single-concern feature
```
feat(angular-portal): add 11-init-module skill

Establishes module ownership conventions (route prefix, permission
namespace, sidebar entry) so 12-init-entity can reuse them without
re-asking.
```

### Bug fix with reference
```
fix(angular-portal): correct form binding pattern in 21-screen-detail

Replaced 9 `formControlName=` occurrences with `[form]+name=` — no
@sd-angular/core form component implements ControlValueAccessor.

Refs #ENG-1247
```

### Chore
```
chore(claude): regenerate .claude/skills mirror

Ran .claude/sync-skills.sh after adding 5 _shared skills.
```

### Breaking change
```
refactor(refs): rename _refs/sd-angular-core to _refs/sdcorejs-angular

BREAKING CHANGE: any skill body that links to _refs/sd-angular-core/**
must be updated. Mirror script will fail until paths are corrected.
```

## Rules

### MUST DO
- Conventional Commits format (`type(scope): subject`)
- Imperative mood subject ≤72 chars
- Heredoc for multi-line bodies
- Stage explicit paths
- Detect scope from staged paths automatically
- Match dominant language of the change (VI changes in docs → VI body; otherwise EN)
- Co-Authored-By footer when AI generated the commit

### MUST NOT
- `git add -A` / `git add .` — sweeps secrets, build artifacts, unrelated work
- `--amend` after a pre-commit hook failure — create a new commit instead
- `--no-verify` / `-n` to bypass hooks — fix the hook failure
- `--no-gpg-sign` to bypass signing unless user explicitly asks
- Commit on `main`/`master`/`release/*` without explicit confirmation
- Commit message in past tense ("added X")
- Subject ending with a period
- Commit with `.env`, credentials, or secrets in the diff
- Force-push to a shared branch

## Anti-patterns
- "update stuff", "fix bug", "wip" — meaningless subjects
- Combining a feature + unrelated refactor + dep bump in one commit
- Subject is fine describing WHAT changed (the diff already shows WHAT, but the subject is the human-readable summary). Body is where you explain WHY. Don't omit the body when the change is non-obvious — future-you wants the reason, not the diff again.
- Manually crafting the commit message when scope detection would have produced something better
- Skipping the body when the change is non-obvious — future-you will want to know WHY
