# Validation Report

Current validation snapshot for the SDCoreJS SDLC Agent repository.

Date: 2026-07-11

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

## Validation Tiers

The project has several validation layers. Keep claims tied to the layer that
actually produced evidence.

| Tier | What it proves | Current evidence | External evidence still required |
|---|---|---|---|
| Static validation | Source layout, frontmatter, exact refs, generated mirrors, markdown fences, text hygiene, and language policy are internally consistent. | `npm run check:text-hygiene`, `npm run check:skills`, and phase 1 E2E tests. | None beyond keeping CI green for the target commit. |
| Deterministic prompt-routing validation (local canonical routing) | The canonical local runner selects the expected `sdcorejs-*` skill for fixture prompts without calling an LLM. | `test/e2e/fixtures/prompt-evals.json` plus phase 1 tests. | Add fixtures when new user intents are introduced. |
| Entrypoint-aware routing validation | Each loaded Claude Code, Codex, Cursor, or Copilot profile contributes derived routing policy; mutation tests prove one changed profile can fail independently. | `test/e2e/entrypoint-smoke.test.mjs`. | This proves deterministic profile-text participation, not live runtime behavior. |
| Parallel protocol simulation | Selected contract, topology/DAG, path/resource, failure/fan-in, repair/evidence, and state-machine rules are exercised through the distributed deterministic validator. | `_refs/orchestration/parallel-protocol.mjs` via `test/e2e/parallel-dispatch-protocol.test.mjs`; includes synthetic boundary inputs plus real temporary Git worktree, result-commit, conflict, and rollback behavior. | This is partial local simulation. External runtimes must still invoke the validator and enforce the skill instructions, capabilities, and repository-specific commands during real sessions. |
| CLI smoke validation | Local adapter code can detect or simulate supported CLI surfaces without requiring live Claude/Codex execution. | Phase 2 tests use fake `codex` and `claude` executables. | Run real CLI smoke tests in a prepared workstation when changing install instructions. |
| Full target-app validation | The golden target-app generator can run the heavyweight E2E path in a prepared environment. | Latest observed successful run: <https://github.com/sdcorejs/sdcorejs-agent/actions/runs/28798513991>. Re-run for the exact release commit. | Attach the release-commit successful GitHub Actions run link to the release notes. |
| Real-agent transcript validation | Actual Claude Code, Codex attached repo, Codex native skills, Cursor, and GitHub Copilot sessions followed the intended skill-selection and approval behavior. | Not proven by deterministic tests. | Store sanitized transcript evidence for each claimed live-tool surface when validating a release. |

Do not describe deterministic prompt-routing results as live-agent behavior. The
deterministic runner is useful for regression coverage, but it is not a
substitute for real-agent transcript validation.

## Static Validation Checklist

| Check | Expected |
|---|---|
| Source skill count | 23 |
| Mirror counts | 23 in `.claude`, `plugin`, and `codex` |
| Text hygiene | No hidden/control/bidi Unicode in tracked text files |
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

These checks are enforced by `npm run check:text-hygiene`,
`npm run check:skills`, and `npm run test:e2e`.

## Revalidation Commands

```bash
npm run sync:skills
npm run check:text-hygiene
npm run check:skills
npm run check:skills:ps
npm run test:e2e:parallel
npm run test:e2e
npm audit --omit=dev
```

For the showcase site:

```bash
cd site
npm ci
npm audit --omit=dev
npm run build
```

CI coverage:

- `CI` runs on pull requests and pushes to `main`.
- `CI` runs `npm ci`, `npm run check:text-hygiene`,
  `npm run check:skills`, `npm run check:audit`, and `npm run test:e2e`
  on Ubuntu.
- `CI` runs a separate site job with `npm ci`, `npm run check:audit`, and
  `npm run build` under `site/`.
- `CI` runs `npm run check:text-hygiene` and `npm run check:skills:ps`
  on Windows.
- `Full E2E` runs `npm run test:e2e:phase4` with `SDCOREJS_E2E_FULL=1` on a
  schedule and through manual dispatch. Release notes should link the latest
  successful run.

## Release Evidence Status

- GitHub Releases and tags are the distribution anchors for adopted versions.
  Publish a release before asking consumers to pin this pack.
- The repository currently has deterministic test and Full E2E infrastructure.
  Real-agent transcript evidence for Claude Code, Codex attached repo, Codex
  native skills, Cursor, and GitHub Copilot is still a release-time requirement
  before claiming full live-agent coverage.
- Repository metadata should describe the project as a portable SDLC skill pack
  for AI coding agents, not as a standalone runtime coding agent.

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
