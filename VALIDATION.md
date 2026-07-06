# Validation Report

Current validation snapshot for the SDCoreJS SDLC Agent repository.

Date: 2026-06-30

## Current Layout

- `skills/**/*.md` - 23 dispatchable source skills.
- `_refs/**` - reference data loaded on demand.
- `.claude/skills/<name>/SKILL.md` - generated Claude Code mirror.
- `plugin/skills/<name>/SKILL.md` - generated Claude plugin mirror.
- `codex/skills/<name>/SKILL.md` - generated Codex-native mirror.
- `codex/skills/_refs/**` - shared Codex reference mirror.
- `.cursor/rules/sdcorejs-agent.mdc` - generated Cursor rule from `AGENTS.md`.

## Inventory

| Bucket | Count |
|---|---:|
| Source skills | 23 |
| Claude Code mirror skills | 23 |
| Plugin mirror skills | 23 |
| Codex mirror skills | 23 |

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
| Documentation executor | `sdcorejs-documentation` |
| Parallel | `sdcorejs-parallel-dispatch` |
| Finish | `sdcorejs-ship (verify-before-done mode)`, `sdcorejs-ship (branch-ready mode)`, `_refs/orchestration/tail/auto-docs.md`, `sdcorejs-documentation (write-user-guide mode)`, `_refs/orchestration/tail/auto-task-tracker.md`, `sdcorejs-explore (memories mode)` when durable knowledge surfaced |

## Validation Checklist

| Check | Expected |
|---|---|
| Source skill count | 23 |
| Mirror counts | 23 in `.claude`, `plugin`, and `codex` |
| Frontmatter | Required `name` and `description`; optional `allowed-tools`; no duplicate keys; no unsupported frontmatter shape |
| Skill names | Unique `sdcorejs-*` kebab-case names |
| Ref links | Exact `_refs/...` paths in skills and refs resolve to committed files |
| Codex mirror | `name` + `description` only, refs rewritten to `../_refs/...` |
| Cursor rule | In sync with `AGENTS.md` |
| Stale mirrors | No missing, changed, or extra generated mirror files |
| Workflow names | No removed legacy skills remain |
| Product track | `sdcorejs-product` exists and product docs/traceability route to it |
| Design track | `sdcorejs-design` exists and design docs/wireframes/PNG previews route to it |
| Test track | `sdcorejs-test` exists and `sdcorejs-execute-plan` routes test-only plans to it |
| Generic harness | `sdcorejs-execute-plan` documents fallback execution |
| Language policy | Source skills/refs/mirrors stay English-only; explicit localization prompt fixtures may use non-English input |

These checks are enforced by `npm run check:skills` and `npm run test:e2e`.

## Revalidation Commands

```bash
npm run sync:skills
npm run check:skills
npm run check:skills:ps
npm run test:e2e
```

CI coverage:

- `CI` runs on pull requests and pushes to `main`.
- `CI` runs `npm ci`, `npm run check:skills`, and `npm run test:e2e` on Ubuntu.
- `CI` runs `npm run check:skills:ps` on Windows.
- `Full E2E` runs `npm run test:e2e:phase4` with `SDCOREJS_E2E_FULL=1` on a
  schedule and through manual dispatch.

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
