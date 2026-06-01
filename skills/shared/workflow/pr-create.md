---
name: sdcorejs-pr-create
description: Use when the user asks to create a pull request, says "tạo PR", "mở PR", "open pull request", "gh pr create", or when a feature branch is ready to ship. Generates PR title + body from commits and diff since the base branch, pushes if needed, opens the PR via `gh` CLI. Applies to angular-portal, nestjs, nextjs and the sdcorejs-agent repo itself. Bilingual (VI/EN).
allowed-tools: Bash, Read
---

# PR Create — From Commits + Diff

## Purpose
Produce a PR description that a reviewer can grok in 30 seconds without opening every file. Capture WHY the change exists, what to test, and what's intentionally out of scope.

## When invoked
- User says "tạo PR", "mở PR", "create PR", "open pull request", "gh pr create"
- After a feature branch is ready (commits pushed, no work pending)

Do NOT invoke if:
- The branch is `main` / `master` (no PR needed; PRs go FROM feature INTO main)
- There are uncommitted changes — commit first
- There are zero commits ahead of the base branch — nothing to PR

## Workflow

### 1. Resolve base branch + state (parallel)
```bash
git rev-parse --abbrev-ref HEAD                # current branch
git remote -v                                  # confirm remote exists
git config branch.$(git rev-parse --abbrev-ref HEAD).remote  # tracking remote
gh repo view --json defaultBranchRef -q .defaultBranchRef.name  # base branch (e.g. main)
```

If `gh` is not authenticated → tell user `gh auth login` first, abort.

### 2. Gather full context (parallel) — read ALL commits, not just HEAD
```bash
git log <base>..HEAD --pretty=format:'%h %s%n%b%n---'  # full commit history with bodies
git diff <base>...HEAD --stat                          # file change summary
git diff <base>...HEAD                                 # full diff for body authoring
```
Note: `..` for log (commit list), `...` for diff (merge-base diff). The triple-dot for diff matches GitHub's PR view.

### 3. Detect language
- VI if VN diacritics dominate commit messages OR target project's primary language is VI
- EN otherwise

### 4. Compose title
- Mirror the most-significant commit's subject, OR synthesize a 1-line summary if 5+ commits
- Conventional Commits style preferred: `feat(scope): subject` — many repos auto-derive PR labels from this
- ≤70 chars
- No trailing period

### 5. Compose body — use this template

```markdown
## Summary
- <bullet 1: what this PR does, user-visible>
- <bullet 2: motivation or constraint driving the change>
- <bullet 3 (optional): notable trade-off, follow-up, or out-of-scope>

## Changes
- <area or module>: <one-line per significant area, derived from --stat>
- ...

## Test plan
- [ ] <verification step 1 — what to click / run>
- [ ] <verification step 2>
- [ ] CI green
- [ ] No regressions in <adjacent feature most at risk>

## Out of scope (optional)
- <thing reviewer might ask about but is deliberately not touched>

## Refs (optional)
- Closes #<issue>
- Related: #<other>
```

Rules for the body:
- Summary bullets ≤3 lines each, ≤3 bullets total
- Test plan must be **specific actions**, not "test thoroughly"
- Skip empty sections (no "N/A" filler)

### 6. Push if needed
```bash
git status -sb            # check if local is ahead of remote
git push -u origin HEAD   # only if branch hasn't been pushed yet
```
NEVER force-push to a shared branch. NEVER push directly to `main`/`master`.

### 7. Create the PR
Always use a heredoc for `--body`:
```bash
gh pr create --base <base> --head <current> \
  --title "<title>" \
  --body "$(cat <<'EOF'
## Summary
- ...

## Test plan
- [ ] ...
EOF
)"
```

If a PR already exists for this branch (`gh pr view --json url` returns one), ask user before creating a duplicate. Offer to update body instead: `gh pr edit <num> --body "..."`.

### 8. Return URL
Print the PR URL so the user can open it.

## Examples

### Small feature PR (VI)
Title: `feat(angular-portal): broaden 31-actions scope beyond workflow`

Body:
```markdown
## Summary
- Rename `31-workflow-actions` → `31-actions`. Broaden the description to cover bulk operations + custom side-effects (export, re-sync, recompute) — workflow is just one shape of action.
- Update the dispatch table in `07-write-code` + all cross-refs in tests + onboarding.

## Changes
- `skills/tracks/angular-portal/31-actions.md`: renamed + broadened body
- `skills/tracks/angular-portal/07-write-code.md`: dispatch table + description
- `skills/tracks/angular-portal/00-onboarding.md`: workflow strip
- `.claude/skills/`, `plugin/skills/`: mirror regenerated via sync-skills.sh

## Test plan
- [ ] Open Claude Code in a target project, type "thêm nút xuất Excel" → `angular-portal-actions` dispatches
- [ ] Type "thêm approve flow" → same skill dispatches
- [ ] `bash .claude/sync-skills.sh --check` passes
```

### Bugfix PR (EN)
Title: `fix(angular-portal): correct formControlName usage in form examples`

Body:
```markdown
## Summary
- No `@sdcorejs/angular` form component implements ControlValueAccessor.
- Replaced `formControlName=` usages with `[form]+name=` pattern across `21-screen-detail.md` + the form templates in `_refs/angular-portal/templates/screen-detail-component.md` and `_refs/angular-portal/templates/reactive-form-templates.md`.

## Test plan
- [ ] Generate a new entity from a clean target project and verify the rendered form binds correctly
- [ ] No `NG0100`/`ExpressionChangedAfterChecked` errors in console
- [ ] Existing entities still bind (no regression)

## Refs
- Closes #ENG-1247
```

## Rules

### MUST DO
- Pull commit history with bodies, not just subjects
- Use triple-dot diff (`...`) for the actual PR view
- Heredoc for `--body` to preserve formatting
- Match language of the dominant change author
- Conventional Commits-style title when commits are
- Push branch first if not pushed
- Provide a concrete test plan (clickable steps)

### MUST NOT
- Create PR with empty body
- Title in past tense ("added X")
- Force-push when creating PR
- Push to `main`/`master`
- Skip `gh auth` check
- Create duplicate PR without asking
- Use `--body-file -` with stdin (unreliable across shells)
- Mention Claude/AI authorship in the title (footer is fine)

## Anti-patterns
- "Update README", "Various fixes", "WIP" titles
- Test plan that says "Tested locally" with no action
- Bullets longer than 2 lines each — reviewer will skim past
- Body that just dumps `git log` output without curation
- Including code snippets in the body (link to the diff instead)
- Creating one giant PR for unrelated work (split first)
