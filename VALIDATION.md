# Validation Report

Current validation snapshot for the SDCoreJS SDLC Agent repository.

Date: 2026-06-09
Repo HEAD observed before this doc update: `8cdbfc0`

## Current Layout

The live source of truth is:

- `skills/**/*.md` - 42 dispatchable source skills. Exclude `_README.md` and any file without `name:` frontmatter.
- `_refs/**` - 147 reference markdown files loaded on demand by skills.
- `.claude/skills/<name>/SKILL.md` - Claude Code mirror, generated from `skills/**/*.md`.
- `plugin/skills/<name>/SKILL.md` - Claude Code plugin mirror, generated from `skills/**/*.md`.
- `.claude/_refs/**` and `plugin/_refs/**` - generated reference mirrors.

`skills/*/*.md` is no longer sufficient. It finds only 26 of 42 source skills and misses nested skills under `skills/shared/*` and `skills/tracks/*`.

## Inventory

| Bucket | Count | Notes |
| --- | ---: | --- |
| Source skills | 42 | `skills/**/*.md`, excluding `skills/tracks/nestjs/_README.md` |
| Claude Code mirror skills | 42 | `.claude/skills/*/SKILL.md` |
| Plugin mirror skills | 42 | `plugin/skills/*/SKILL.md` |
| Reference docs | 147 | `_refs/**/*.md` |
| Orchestration skills | 19 | Includes `write-user-guide` |
| Track write-code skills | 3 | `angular-write-code`, `nestjs-write-code`, `nextjs-write-code` |

Reference doc counts by top-level bucket:

| Bucket | Count |
| --- | ---: |
| `_refs/angular` | 105 |
| `_refs/infra` | 1 |
| `_refs/nestjs` | 13 |
| `_refs/nextjs` | 19 |
| `_refs/sdlc` | 3 |
| `_refs/shared` | 6 |

## Validation Checklist

| Check | Current result | Evidence / command |
| --- | --- | --- |
| Source skill count | PASS | `Get-ChildItem -Recurse -File skills -Filter *.md | ? Name -ne '_README.md'` -> 42 |
| Mirror counts | PASS | `.claude/skills` -> 42, `plugin/skills` -> 42 |
| Frontmatter uniqueness | PASS | No duplicate `name:` fields found in source skills |
| Frontmatter naming | PASS | All source skill names are kebab-case and have `description:` |
| Dispatch glob | PASS | Entry points use `skills/**/*.md`; old shallow glob is treated as invalid |
| `_refs` packaging | PASS | `package.json.files` includes `_refs`; README install docs copy/symlink `_refs` |
| Admin packs documented | PASS | `admin-screens` and `init-admin` appear in source frontmatter and entrypoint summaries |
| Tail chain documented | PASS | Entry points include `auto-docs -> write-user-guide -> auto-task-tracker` |
| Official bash check on this Windows host | FAIL / environment | `npm.cmd run check:skills` requires `bash` on PATH |
| PowerShell check wrapper | FAIL / script bug | `npm.cmd run check:skills:ps` currently reports `Unknown flag: -` |

The remaining failures are validation-command issues, not skill inventory drift. `powershell -ExecutionPolicy Bypass -File .claude/sync-skills.ps1` runs sync mode successfully, but check mode currently passes the flag incorrectly.

## Source Skill List

### Track Skills

| Path | Skill |
| --- | --- |
| `skills/tracks/angular/write-code.md` | `angular-write-code` |
| `skills/tracks/nestjs/write-code.md` | `nestjs-write-code` |
| `skills/tracks/nextjs/write-code.md` | `nextjs-write-code` |

### Design Phase

| Path | Skill |
| --- | --- |
| `skills/shared/sdlc/01-brainstorm.md` | `sdcorejs-brainstorm` |
| `skills/shared/sdlc/02-clarify-requirements.md` | `sdcorejs-clarify-requirements` |
| `skills/shared/sdlc/03-write-spec.md` | `sdcorejs-write-spec` |
| `skills/shared/sdlc/04-review-spec.md` | `sdcorejs-review-spec` |
| `skills/shared/sdlc/05-write-plan.md` | `sdcorejs-write-plan` |
| `skills/shared/sdlc/06-review-plan.md` | `sdcorejs-review-plan` |

### Orchestration

| Path | Skill |
| --- | --- |
| `skills/orchestration/auto-docs.md` | `sdcorejs-auto-docs` |
| `skills/orchestration/auto-plans.md` | `sdcorejs-auto-plans` |
| `skills/orchestration/auto-specs.md` | `sdcorejs-auto-specs` |
| `skills/orchestration/auto-summary.md` | `sdcorejs-auto-summary` |
| `skills/orchestration/auto-task-tracker.md` | `sdcorejs-auto-task-tracker` |
| `skills/orchestration/branch-ready.md` | `sdcorejs-branch-ready` |
| `skills/orchestration/comment-code.md` | `sdcorejs-comment-code` |
| `skills/orchestration/memories.md` | `sdcorejs-memories` |
| `skills/orchestration/parallel-dispatch.md` | `sdcorejs-parallel-dispatch` |
| `skills/orchestration/persona.md` | `sdcorejs-persona` |
| `skills/orchestration/recovery.md` | `sdcorejs-recovery` |
| `skills/orchestration/repair-loop.md` | `sdcorejs-repair-loop` |
| `skills/orchestration/ship.md` | `sdcorejs-ship` |
| `skills/orchestration/solution-builder.md` | `sdcorejs-solution-builder` |
| `skills/orchestration/subagent-driven-dev.md` | `sdcorejs-subagent-driven-dev` |
| `skills/orchestration/using-skills.md` | `sdcorejs-using-skills` |
| `skills/orchestration/using-worktrees.md` | `sdcorejs-using-worktrees` |
| `skills/orchestration/verify-before-done.md` | `sdcorejs-verify-before-done` |
| `skills/orchestration/write-user-guide.md` | `sdcorejs-write-user-guide` |

### Review, Testing, Infra, Workflow

| Path | Skill |
| --- | --- |
| `skills/review/review.md` | `sdcorejs-review` |
| `skills/review/architecture.md` | `sdcorejs-review-architecture` |
| `skills/testing/test.md` | `sdcorejs-test` |
| `skills/testing/tdd.md` | `sdcorejs-tdd` |
| `skills/infra/auth.md` | `sdcorejs-auth` |
| `skills/infra/dockerize.md` | `sdcorejs-dockerize` |
| `skills/infra/run-guide.md` | `sdcorejs-run-guide` |
| `skills/shared/conventions/changelog.md` | `sdcorejs-changelog` |
| `skills/shared/conventions/commit.md` | `sdcorejs-commit` |
| `skills/shared/conventions/dep-update.md` | `sdcorejs-dep-update` |
| `skills/shared/workflow/code-map.md` | `sdcorejs-code-map` |
| `skills/shared/workflow/debug.md` | `sdcorejs-debug` |
| `skills/shared/workflow/env-setup.md` | `sdcorejs-env-setup` |
| `skills/shared/workflow/pr-create.md` | `sdcorejs-pr-create` |

## Revalidation Commands

PowerShell inventory checks:

```powershell
$src = Get-ChildItem -Recurse -File -Path skills -Filter *.md |
  Where-Object { $_.Name -ne '_README.md' }
$claude = Get-ChildItem -Recurse -File -Path .claude\skills -Filter SKILL.md
$plugin = Get-ChildItem -Recurse -File -Path plugin\skills -Filter SKILL.md
$refs = Get-ChildItem -Recurse -File -Path _refs -Filter *.md
[PSCustomObject]@{
  SourceSkills = $src.Count
  ClaudeMirror = $claude.Count
  PluginMirror = $plugin.Count
  RefDocs = $refs.Count
}
```

Frontmatter sanity:

```powershell
$items = Get-ChildItem -Recurse -File -Path skills -Filter *.md |
  Where-Object { $_.Name -ne '_README.md' } |
  ForEach-Object {
    $lines = Get-Content $_.FullName -TotalCount 20
    $name = ($lines | Where-Object { $_ -match '^name:' } | Select-Object -First 1) -replace '^name:\s*',''
    $desc = ($lines | Where-Object { $_ -match '^description:' } | Select-Object -First 1) -replace '^description:\s*',''
    [PSCustomObject]@{ Path=$_.FullName; Name=$name; HasDescription=($desc.Length -gt 0); Kebab=($name -match '^[a-z0-9-]+$') }
  }
$items | Group-Object Name | Where-Object Count -gt 1
$items | Where-Object { -not $_.Kebab -or -not $_.HasDescription }
```

Entrypoint drift checks:

```powershell
rg -n "skills/\*/\*.md|skills-sdcorejs|_refs-sdcorejs|skills/shared/sdlc/_refs|skills/tracks/angular/_refs|angular-onboarding|00-onboarding|18 files" CLAUDE.md AGENTS.md README.md .github
rg -n "admin-screens|init-admin|write-user-guide|skills/\*\*/\*.md" CLAUDE.md AGENTS.md README.md .github skills/tracks
```

Official mirror checks:

```bash
npm run check:skills
```

On Windows without `bash` on `PATH`, use:

```powershell
npm run check:skills:ps
```

Known current issue: `check:skills:ps` still fails in check mode until `.claude/sync-skills.ps1` flag forwarding is fixed.
