# Release Changelog

Reference body for `sdcorejs-git` changelog mode. Load this file only when the
user asks for release notes or CHANGELOG work, or when `sdcorejs-ship` enters an
approved release path.

## Purpose

Produce a release-ready `CHANGELOG.md` entry or release-note artifact from real
commit history. Convert typed commits into user-facing notes, group them by
Keep a Changelog sections, flag risky or untyped commits, redact suspected
secrets, and recommend a semver bump without creating tags or releases.

## Scope And Write Boundary

Changelog mode may edit only explicit release artifacts:

- `CHANGELOG.md`
- release-note files requested by the user
- repo-defined release artifact files named by docs or scripts

It must not edit source code, generated mirrors, package versions, tags,
GitHub releases, or unrelated docs unless the user explicitly requested that
separate operation.

Changelog and release-note writes invalidate any earlier branch-ready evidence.
If these artifacts are generated before a commit, PR, tag, or release handoff,
`sdcorejs-ship (branch-ready mode)` must run again after the writes and before
`sdcorejs-git` creates artifacts.

## Preflight

1. Inspect dirty state before writing:

```bash
git status --short
```

2. If unrelated dirty source changes exist, ask one numbered decision:

```text
I found dirty changes outside the changelog/release-note scope.

1. Continue with changelog file only.
2. Include selected release artifact files.
3. Stop so you can clean or stash changes first.

Reply with `1`, `2`, or `3`.
```

3. Do not mix changelog edits with unrelated dirty source changes.
4. Run the secret redaction protocol before printing commit bodies, diff
   excerpts, or release-note text.

## Secret Redaction

- Never include secret values from commit messages, commit bodies, diffs, config files, `.env` files, CI output, or local shell output.
- If commit messages or bodies contain suspected secrets, redact them and flag the risk.
- Report suspected secret evidence as file/commit, key or category name, reason, and redacted evidence such as `TOKEN=[REDACTED]`.
- Do not paste raw suspicious lines into chat, changelog entries, release notes, commit messages, or PR bodies.

## Determine The Release Range

Use the first available explicit source:

1. User-supplied range, tag, SHA, date, or base branch.
2. Latest tag:

```bash
git describe --tags --abbrev=0
```

3. Latest `CHANGELOG.md` release header:

```bash
grep -m1 '^## \[' CHANGELOG.md
```

4. Explicit user choice when no baseline is clear:
   `1. Commit SHA` / `2. Date` / `3. From the beginning`.

Do not guess a release range when multiple plausible bases exist. For a base
branch range, fetch the base explicitly and bind the range to that remote base.

## Pull And Classify Commits

Read actual commit history:

```bash
git log <range> --pretty=format:'%H%x09%s%x09%b%x1F' --no-merges
```

Filter merge commits, previous release commits, reverted commits, and matching
reverts.

Classify Conventional Commits:

| Commit type | Changelog section |
|---|---|
| `feat` | Added |
| `feat!` or `BREAKING CHANGE` | Changed, with BREAKING marker |
| `fix` | Fixed |
| `perf` | Changed, with `Performance:` prefix |
| `refactor` | Omit unless API or behavior changed |
| `revert` | Fixed, or omit when it cancels an unreleased change |
| `deprecate` | Deprecated |
| `security` | Security |
| `docs`, `style`, `test`, `chore`, `ci`, `build` | Omit unless the user requests an exhaustive log |

Untyped commits go under `Other` and must be surfaced for human review.

## Suggest Semver

| Highest class | Recommendation |
|---|---|
| Breaking change | major |
| `feat` | minor |
| `fix`, `perf`, or `revert` | patch |
| only docs/chore/test/build/ci/style | no release; ask user |

State the bump rationale in chat, not inside the changelog entry. Changelog
mode may suggest semver based on Conventional Commits, but must not bump the
version automatically.

## Version And Date

If version/date is missing and the repo convention requires it, ask for the
missing value. If the repo convention has an `Unreleased` section, use or update
that section rather than inventing a version.

Do not create a versioned entry when the user asked only for draft release
notes unless they confirm the version/date.

## Write The Entry

Use Keep a Changelog style:

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

Insert/update rules:

- If `## [Unreleased]` exists, move relevant content into the new versioned section and reset `Unreleased` only when the user requested a versioned release entry.
- If no `CHANGELOG.md` exists, ask before creating one using `1. Create CHANGELOG.md` / `2. Stop`.
- Insert newest release above older releases.
- Preserve hand-edited content.
- Do not write a changelog when there are zero classifiable changes unless the user explicitly asked for an exhaustive log.

## Monorepo Notes

- Single stack repo: use root `CHANGELOG.md`.
- Monorepo: prefer per-app changelogs and path-filtered ranges when repo convention supports them.
- This repo: use the root `CHANGELOG.md` and the skill-pack version.

## Release/Tag Boundaries

Do not do any of the following by default:

- create tags
- push tags
- bump package versions
- create GitHub releases
- publish packages
- push branches

Only do those operations after explicit user approval and clean verification
evidence from the appropriate `sdcorejs-ship` workflow, including final
branch-ready evidence collected after any changelog or release-note writes.

## Output

Report:

- selected range and why;
- files considered;
- sections generated;
- semver recommendation and rationale;
- skipped or untyped commits requiring review;
- suspected secret findings with redacted evidence only;
- dirty-work decision if applicable;
- files written or draft-only status.

## Rules

- Read actual commit messages.
- Inspect `git status --short` before writing.
- Keep changelog edits isolated from unrelated dirty work.
- Use Keep a Changelog format.
- Suggest semver and explain why.
- Do not tag, push tags, bump versions, create releases, or publish by default.
- Do not include AI co-author footers.
- Do not include secret values.
- Match the existing changelog language when one exists.
