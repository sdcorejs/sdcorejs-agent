# SDCoreJS

[![CI](https://github.com/sdcorejs/sdcorejs-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/sdcorejs/sdcorejs-agent/actions/workflows/ci.yml)
[![Full E2E](https://github.com/sdcorejs/sdcorejs-agent/actions/workflows/full-e2e.yml/badge.svg)](https://github.com/sdcorejs/sdcorejs-agent/actions/workflows/full-e2e.yml)

A portable SDLC skill pack for AI coding agents. Works in Claude Code,
GitHub Copilot, Codex, and Cursor.

Requests flow through:

```text
brainstorming -> spec -> plan -> execute-plan -> track executor -> finish gates -> ship -> git
```

The pack is documentation-driven: markdown skills plus `_refs/` knowledge. There is no runtime server.

## Tracks

| Track | Executor |
|---|---|
| Angular Portal | `sdcorejs-angular` |
| NestJS | `sdcorejs-nestjs` |
| Next.js | `sdcorejs-nextjs` |
| Product | `sdcorejs-product` |
| Design | `sdcorejs-design` |
| Test | `sdcorejs-test` |
| Generic harness | `sdcorejs-execute-plan` fallback |

## Workflow

```text
Request
  -> sdcorejs-brainstorming
       Explore if needed, then confirm blockers.
  -> sdcorejs-spec
       Write spec, ask for approval, and persist approved spec.
  -> sdcorejs-plan
       Write numbered plan, ask for approval, and persist approved plan.
  -> sdcorejs-execute-plan
       Detect track and always ask sequential vs parallel.
  -> executor
       angular | nestjs | nextjs | product | design | test | generic harness
  -> finish gate and tail chain
```

The two approval gates and approved snapshot writes live inside `sdcorejs-spec` and `sdcorejs-plan`. `sdcorejs-execute-plan` owns track detection, product-track routing, design-track routing, test-track routing, generic harness fallback, and the sequential/parallel question.

## Quick Start

This repository is public source, but the root Node package is intentionally
`private: true`; it is not published to npm. Use GitHub/plugin installation,
submodules, or generated native skill mirrors as the distribution paths.

The canonical package manager for repository validation is npm. Use the
committed `package-lock.json` with:

```bash
npm ci
npm run check:text-hygiene
npm run check:skills
npm run test:e2e
```

## 5-Minute Adoption

Pick one install path, start a fresh agent session, then use the smoke prompt to
confirm dispatch behavior before adopting the pack for real work.

| Tool path | Install or attach | Smoke prompt | Expected observation |
|---|---|---|---|
| Claude Code plugin | Install from the plugin marketplace. | `Use sdcorejs-documentation to summarize this repo's validation posture.` | A documentation skill loads, creates a tasklist for non-trivial work, and reports verification status. |
| Codex attached repo | Add this repo as a submodule or keep `AGENTS.md` at the target root. | `Use the SDCoreJS flow to plan a small docs update.` | `AGENTS.md` routes to brainstorming/spec/plan discipline instead of writing immediately. |
| Codex native skills | Copy `codex/skills/**` plus `codex/skills/_refs/**` into `$CODEX_HOME/skills`. | `Use sdcorejs-documentation to write a short technical doc.` | The skill resolves `../_refs/...` and follows tasklist/verification rules. |
| Cursor or Copilot | Use `AGENTS.md`, `.cursor/rules/**`, or `.github/**` entrypoints. | `Create acceptance criteria for a small feature using SDCoreJS.` | Product/design/test/doc routing selects the matching workflow. |

For release adoption, pin a Git tag or GitHub Release rather than a floating
branch, then record the exact tool versions and transcript evidence.

### Claude Code Plugin

```text
/plugin marketplace add sdcorejs/sdcorejs-agent
/plugin install sdcorejs-agent@sdcorejs
```

### Codex Native Skills

```powershell
npm run sync:skills
$dest = if ($env:CODEX_HOME) { Join-Path $env:CODEX_HOME "skills" } else { Join-Path $HOME ".codex\skills" }
New-Item -ItemType Directory -Force $dest | Out-Null
Copy-Item .\codex\skills\* $dest -Recurse -Force
```

Restart Codex after copying. Keep `codex/skills/_refs` with the skills.

### Attached Repo / Submodule

```bash
cd <your-project>
git submodule add <repo-url> .sdcorejs-agent
ln -s .sdcorejs-agent/CLAUDE.md CLAUDE.md
ln -s .sdcorejs-agent/AGENTS.md AGENTS.md
ln -s .sdcorejs-agent/skills skills
ln -s .sdcorejs-agent/_refs _refs
```

## Tool Support

| Tool | Reads | Verification |
|---|---|---|
| Claude Code plugin | `plugin/skills/**`, `plugin/_refs/**` | `npm run check:skills` verifies plugin mirrors |
| Claude Code direct | `CLAUDE.md`, `.claude/skills/**` | `npm run check:skills` verifies Claude mirrors |
| Codex attached repo | `AGENTS.md` | Entry-point smoke tests cover dispatch guidance |
| Codex native | `codex/skills/**` | `npm run check:skills` verifies Codex mirrors and `_refs` |
| Cursor | `AGENTS.md`, generated `.cursor/rules/sdcorejs-agent.mdc` | Cursor rule is regenerated from `AGENTS.md` |
| GitHub Copilot | `.github/copilot-instructions.md`, `.github/chatmodes/sdcorejs.chatmode.md` | Entry-point smoke tests cover Copilot profile |

For adoption guidance, compatibility evidence, and expected live-tool
transcripts, see:

- `docs/ADOPTION.md` - when to use this pack, when not to use it, fast-fix
  rules, compatibility matrix, and adoption checklist.
- `docs/WORKED_EXAMPLE.md` - example full workflow from request through
  evidence summary.
- `docs/TROUBLESHOOTING.md` - mirror drift, Codex refs, text hygiene, plugin,
  and Full E2E troubleshooting.
- `docs/REAL_AGENT_VALIDATION.md` - sanitized transcript evidence template.
- `docs/RELEASE_PROCESS.md` - tag/release checklist.

## Repo Layout

```text
skills/                 source skills, 23 dispatchable skill files
_refs/                  source reference docs
.claude/skills/         generated Claude mirror
plugin/skills/          generated Claude plugin mirror
codex/skills/           generated Codex-native mirror
.cursor/rules/          generated Cursor rule
scripts/sync-skills.mjs cross-platform mirror generator
```

Run after editing source skills, refs, or `AGENTS.md`:

```bash
npm run sync:skills
npm run check:skills
```

See `MIRROR_POLICY.md` for canonical source ownership and generated mirror
review rules.

## Release Discipline

- Keep `CHANGELOG.md` updated for user-visible skill, ref, workflow, or
  validation changes.
- Create GitHub releases and tags for adopted versions; follow
  `docs/RELEASE_PROCESS.md` and include validation commands, CI run links, Full
  E2E evidence, and real-agent transcript evidence in release notes.
- Treat generated mirrors as supported distribution artifacts. Any source
  change to `skills/`, `_refs/`, or `AGENTS.md` must be followed by
  `npm run sync:skills` and `npm run check:skills`.
- For upgrades, compare the previous tag to the new tag and review
  `CHANGELOG.md`, `VALIDATION.md`, and `docs/ADOPTION.md`.
- Keep repository metadata aligned with this positioning: this is a portable
  SDLC skill pack, not a standalone runtime coding agent.

## Mandatory Behavior

- Runtime-localized output: respond in the user's language and preserve locale-specific marks.
- Non-trivial skills apply `_refs/shared/project-context.md` before executing so direct triggers load summaries, resume checkpoints, specs/plans, tasks, and relevant memories.
- Non-trivial execution tasks use `_refs/shared/tasklist.md`: create a visible `Tasks` section before work starts, update it as work progresses, and disclose skipped verification, blockers, and risks.
- Long or interruptible tasks mirror that progress to `.sdcorejs/tasks/current-session.md` so another context window or AI can resume.
- Requirements before code: use `sdcorejs-brainstorming` until blockers are confirmed.
- For explicitly small low-risk edits, use the fast-fix path in
  `docs/ADOPTION.md`; escalate to the full workflow if scope grows.
- Explicit approval required for spec and plan.
- Approved plans execute through `sdcorejs-execute-plan`.
- `sdcorejs-execute-plan` always asks sequential vs parallel.
- Product/PO docs, user stories, acceptance criteria, UAT, and traceability use the `sdcorejs-product` track.
- UI/UX design, FE handoff specs, wireframes, and PNG previews use the `sdcorejs-design` track.
- Solution-builder roots use `product/`, `design/`, `backend/`, `frontend/`, `test/`, and `.sdcorejs/`; human product docs live in `product/`, design handoff lives in `design/`, while logs/ledgers/evidence stay in `.sdcorejs/`.
- Test-only plans use the `sdcorejs-test` track.
- Codebase understanding, summaries, flow tracing, and local setup discovery use `sdcorejs-explore`.
- Final gate, acceptance verification, branch readiness, dependency-update delivery, ready-to-merge, and release readiness use `sdcorejs-ship`.
- Commit, PR, changelog, release notes, and Git artifact creation use `sdcorejs-git`.
- Unknown stacks can still run through the generic harness fallback.
- Every code-generation run presents the finish gate before tail steps.
- Never claim pass, built, fixed, or done without current verification output.

## License

MIT
