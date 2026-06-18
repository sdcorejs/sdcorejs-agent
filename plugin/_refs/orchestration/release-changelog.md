# Release Changelog

Reference body for `sdcorejs-git` changelog mode. Load this file only
when the user asks for release notes / CHANGELOG work or when ship mode enters a
release path.

## Purpose

Produce a release-ready `CHANGELOG.md` entry from real commit history. Convert
typed commits into user-facing notes, group them by Keep a Changelog sections,
and recommend a semver bump.

## Workflow

1. Locate the release baseline:

```bash
git describe --tags --abbrev=0 2>/dev/null
grep -m1 '^## \[' CHANGELOG.md 2>/dev/null
```

If there is no tag or changelog header, ask for a baseline: commit SHA, date, or
"from the beginning".

2. Pull the commit range:

```bash
git log <range> --pretty=format:'%H%x09%s%x09%b%x1F' --no-merges
```

Filter merge commits, previous release commits, reverted commits, and matching
reverts.

3. Classify Conventional Commits:

| Commit type | Changelog section |
|---|---|
| `feat` | Added |
| `feat!` / `BREAKING CHANGE` | Changed, with BREAKING marker |
| `fix` | Fixed |
| `perf` | Changed, with "Performance:" prefix |
| `refactor` | Omit unless API/behavior changed |
| `revert` | Fixed, or omit when it cancels an unreleased change |
| `deprecate` | Deprecated |
| `security` | Security |
| `docs`, `style`, `test`, `chore`, `ci`, `build` | Omit unless the user requests an exhaustive log |

Untyped commits go under `Other` and must be surfaced for human review.

4. Suggest semver:

| Highest class | Bump |
|---|---|
| Breaking change | major |
| `feat` | minor |
| `fix`, `perf`, `revert` | patch |
| only docs/chore/test/build/ci/style | no release; ask user |

State the bump rationale in chat, not inside the changelog entry.

5. Write the entry in Keep a Changelog style:

```markdown
## [<NEW_VERSION>] - <YYYY-MM-DD>

### Added
- <user-facing feature summary> (commit abc1234)

### Changed
- **BREAKING**: <change and migration hint> (#123)

### Fixed
- <user-facing bug fix> (#124)
```

Skip empty sections. Paraphrase for readers instead of copying commit subjects
verbatim. Include PR numbers when available; otherwise use short SHAs.

6. Insert/update `CHANGELOG.md`:

- If `## [Unreleased]` exists, move relevant content into the new versioned
  section and reset `Unreleased`.
- If no `CHANGELOG.md` exists, ask before creating one.
- Insert newest release above older releases.
- Preserve hand-edited content.

## Monorepo Notes

- Single stack repo: use root `CHANGELOG.md`.
- Monorepo: prefer per-app changelogs and path-filtered ranges, for example
  `git log <range> -- apps/<app>/`.
- This repo: use the root `CHANGELOG.md` and the skill-pack version.

## Rules

- Read actual commit messages.
- Use Keep a Changelog format.
- Suggest semver and explain why.
- Do not tag, push, or bump versions without explicit approval.
- Do not write a changelog when there are zero classifiable changes.
- Do not include AI co-author footers.
- Match the existing changelog language when one exists.
