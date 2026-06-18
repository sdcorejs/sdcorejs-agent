# Validation Report

Current validation snapshot for the SDCoreJS SDLC Agent repository.

Date: 2026-06-18

## Current Layout

- `skills/**/*.md` - 24 dispatchable source skills.
- `_refs/**` - reference data loaded on demand.
- `.claude/skills/<name>/SKILL.md` - generated Claude Code mirror.
- `plugin/skills/<name>/SKILL.md` - generated Claude plugin mirror.
- `codex/skills/<name>/SKILL.md` - generated Codex-native mirror.
- `codex/skills/_refs/**` - shared Codex reference mirror.
- `.cursor/rules/sdcorejs-agent.mdc` - generated Cursor rule from `AGENTS.md`.

## Inventory

| Bucket | Count |
|---|---:|
| Source skills | 24 |
| Claude Code mirror skills | 24 |
| Plugin mirror skills | 24 |
| Codex mirror skills | 24 |

## Workflow Inventory

| Area | Skills |
|---|---|
| Discovery | `sdcorejs-brainstorming` |
| Spec gate | `sdcorejs-spec` |
| Plan gate | `sdcorejs-plan` |
| Execution gate | `sdcorejs-execute-plan` |
| App executors | `sdcorejs-angular`, `sdcorejs-nestjs`, `sdcorejs-nextjs` |
| Product executor | `sdcorejs-product` |
| Design executor | `sdcorejs-design` |
| Test executor | `sdcorejs-test` |
| Parallel | `sdcorejs-parallel-dispatch` |
| Finish | `sdcorejs-ship (verify-before-done mode)`, `sdcorejs-ship (branch-ready mode)`, `_refs/orchestration/tail/auto-docs.md`, `sdcorejs-write-user-guide`, `_refs/orchestration/tail/auto-task-tracker.md`, `sdcorejs-explore (memories mode)` when durable knowledge surfaced |

## Validation Checklist

| Check | Expected |
|---|---|
| Source skill count | 24 |
| Mirror counts | 24 in `.claude`, `plugin`, and `codex` |
| Frontmatter | Unique kebab-case `name`, non-empty `description` |
| Codex mirror | `name` + `description` only, refs rewritten to `../_refs/...` |
| Cursor rule | In sync with `AGENTS.md` |
| Workflow names | No removed legacy skills remain |
| Product track | `sdcorejs-product` exists and product docs/traceability route to it |
| Design track | `sdcorejs-design` exists and design docs/wireframes/PNG previews route to it |
| Test track | `sdcorejs-test` exists and `sdcorejs-execute-plan` routes test-only plans to it |
| Generic harness | `sdcorejs-execute-plan` documents fallback execution |

## Revalidation Commands

```bash
npm run sync:skills
npm run check:skills
npm run check:skills:ps
npm run test:e2e
```

PowerShell inventory:

```powershell
$src = Get-ChildItem -Recurse -File -Path skills -Filter *.md | Where-Object { $_.Name -ne '_README.md' }
$claude = Get-ChildItem -Recurse -File -Path .claude\skills -Filter SKILL.md
$plugin = Get-ChildItem -Recurse -File -Path plugin\skills -Filter SKILL.md
$codex = Get-ChildItem -Recurse -File -Path codex\skills -Filter SKILL.md
[PSCustomObject]@{
  SourceSkills = $src.Count
  ClaudeMirror = $claude.Count
  PluginMirror = $plugin.Count
  CodexMirror = $codex.Count
}
```

Removed-name scan should return no matches for deleted design skills in source docs and tests.
