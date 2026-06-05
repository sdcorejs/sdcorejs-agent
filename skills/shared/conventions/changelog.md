---
name: sdcorejs-changelog
description: Use when the user asks to generate a CHANGELOG entry, says "viết changelog", "tạo changelog", "update CHANGELOG", "what changed since vX.Y.Z", or is preparing a release, or auto-invoked by sdcorejs-ship on release path. Reads commit history since the last tag, groups commits by Conventional Commits type, suggests a semver bump, and writes a `Keep a Changelog`-formatted entry under `## [Unreleased]` or `## [X.Y.Z]`. Applies to angular, nestjs, nextjs and the sdcorejs-agent repo itself. Bilingual (VI/EN).
allowed-tools: Bash, Read, Edit, Write
---

# Changelog — From Conventional Commits

## Purpose
Produce a release-ready CHANGELOG entry without manual scrubbing of `git log`. Convert commit-typed history into a user-facing summary grouped by audience-meaningful sections (Added / Changed / Fixed / …) and propose the right semver bump.

## When invoked
- "viết changelog", "tạo changelog", "update CHANGELOG"
- "what changed since vX.Y.Z" / "release notes"
- Before a tag / release / publish
- Auto-invoked by `sdcorejs-ship` when release mode is detected (Step 4 of ship chain)

Do NOT invoke if:
- The repo has no commits since the last entry
- The repo doesn't use Conventional Commits (the output will be low-signal) — instead, ask the user

## Workflow

### 1. Locate the last release point
```bash
# Latest tag (if tags exist)
git describe --tags --abbrev=0 2>/dev/null

# Or fall back to the latest changelog entry header
grep -m1 '^## \[' CHANGELOG.md 2>/dev/null
```
If no tag and no CHANGELOG → ask user where the baseline should be (a commit SHA, a date, or "from the beginning").

### 2. Pull commit range
```bash
RANGE="${LAST_TAG}..HEAD"          # or commit SHA range
git log "$RANGE" --pretty=format:'%H%x09%s%x09%b%x1F' --no-merges
```
Filter out:
- Merge commits (already excluded by `--no-merges`)
- `chore: release vX.Y.Z` commits (the previous release itself)
- Reverted commits and their reverts (cancel out)

### 3. Classify by Conventional Commits type

| Commit type | CHANGELOG section |
|---|---|
| `feat` | **Added** |
| `feat!` / `BREAKING CHANGE` | **Changed** (with ⚠️ BREAKING marker) |
| `fix` | **Fixed** |
| `perf` | **Changed** (with "Performance:" prefix) |
| `refactor` | usually omitted unless user-visible — surface if it changes API/behavior |
| `revert` | **Fixed** (with revert context) OR omit if it cancels an unreleased change |
| `deprecate` | **Deprecated** |
| `security` (rare custom type) | **Security** |
| `docs`, `style`, `test`, `chore`, `ci`, `build` | OMIT unless user explicitly wants exhaustive log |

Commits without a parseable type → put under `### Other` and flag to user.

### 4. Suggest semver bump

| Highest commit class in range | Bump |
|---|---|
| Any `feat!` or `BREAKING CHANGE` footer | **major** |
| Any `feat:` (no breaking) | **minor** |
| Only `fix:` / `perf:` / `revert:` | **patch** |
| Only `chore:` / `docs:` / etc | **no-release** (ask user) |

State the bump rationale in the agent's reply, not in the CHANGELOG itself.

### 5. Write the entry

Use `Keep a Changelog` format (https://keepachangelog.com):

```markdown
## [<NEW_VERSION>] - <YYYY-MM-DD>

### Added
- <user-visible feature summary> (commit abc1234)
- <another feature>

### Changed
- ⚠️ **BREAKING**: <breaking change description and migration hint> (#PR)
- <perf or behavior change>

### Deprecated
- <thing flagged for removal>

### Removed
- <thing actually removed>

### Fixed
- <bug fix in user-visible terms> (#PR)

### Security
- <security advisory if relevant>
```

Rules for the entry body:
- One bullet per commit, paraphrased into user-visible language (not the commit subject verbatim)
- Reference PR number `(#NN)` if available; commit SHA short form otherwise
- Group `BREAKING CHANGE` items at the TOP of their section with `⚠️` marker
- Skip empty sections (no "N/A" filler)
- Match the changelog's existing language (VI / EN) if the file already has entries; otherwise match the dominant commit-message language

### 6. Insert / update CHANGELOG.md

If `## [Unreleased]` exists → move its contents into the new versioned section and reset `## [Unreleased]` to empty subsections.

If no CHANGELOG.md exists → ask user before creating one. If they say yes, scaffold:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [<NEW_VERSION>] - <YYYY-MM-DD>

<entry from step 5>
```

### 7. Report back to user
Include in the chat reply (not the file):
- New version + reason for the bump
- Number of commits processed / classified / dropped
- Items needing human review (untyped commits, BREAKING items, security-adjacent fixes)
- Suggest next step: if invoked standalone → tag + push + `sdcorejs-pr-create`; if
  invoked via `sdcorejs-ship` → return control to the ship orchestrator; it continues at Step 5

## Examples

### Patch release (VI)
```markdown
## [1.2.3] - 2026-05-16

### Fixed
- Sửa lỗi binding form trong `21-screen-detail`: 9 instance `formControlName` được thay bằng `[form]+name=` (#142)
- Sửa stale link tới `_refs/sd-angular-core/` (#143)
```

### Minor with breaking (EN)
```markdown
## [2.0.0] - 2026-06-01

### Changed
- ⚠️ **BREAKING**: Renamed `_refs/sd-angular-core/` to `_refs/sdcorejs-angular/`. Update any skill body that links to the old path. (#150)

### Added
- New `sdcorejs-recovery` skill for resuming work after a break (#155)
- Lefthook-based sync enforcement for `.claude/skills/` mirror (#156)

### Fixed
- `sync-skills.sh --check` now correctly returns non-zero on drift (#157)
```

## Per-track / monorepo notes

- **Single-repo (one stack)**: one CHANGELOG.md at the root, versions follow that stack.
- **Monorepo (Angular portal + NestJS API + NextJS site)**: prefer per-package CHANGELOGs at `apps/<app>/CHANGELOG.md` so each can release independently. Use tag prefixes (`portal-v1.2.0`, `api-v0.9.0`) and filter commit range by path: `git log <range> -- apps/<app>/`.
- **sdcorejs-agent repo itself**: a single CHANGELOG.md at root, versioned by skill-pack version (currently 0.1.0).

## Rules

### MUST DO
- Read the actual commit messages, do not invent
- Suggest a semver bump and state the reason
- Use Keep a Changelog format
- Filter merge / chore-release / reverted-pair commits
- Match changelog language if file already exists
- Insert above the previous version (newest first)
- Surface uncategorized commits for human review

### MUST NOT
- Auto-bump version in `package.json` without user confirmation
- Tag / push automatically — leave that to the user (or the release script)
- Include `docs:` / `chore:` / `style:` / `ci:` / `build:` in a user-facing changelog
- Write a CHANGELOG entry when there are zero classifiable changes
- Overwrite the user's hand-edited entries — append/insert, never replace
- Copy commit subjects verbatim into the changelog (paraphrase for users)

## Anti-patterns
- "Various improvements" — meaningless to readers; expand or omit
- One bullet per commit when 5 commits all do the same refactor — collapse into one
- Including the AI Co-Authored-By footers in changelog bullets
- Tagging `v1.0.0` for a tiny patch (use 0.x.y while pre-stable)
- Writing entries in a different language than the previous entries in the same file
