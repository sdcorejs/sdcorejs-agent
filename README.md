# SDCoreJS

An orchestrated SDLC skill pack for AI coding agents. Works in Claude Code, GitHub Copilot, Codex, and Cursor.

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

| Tool | Reads |
|---|---|
| Claude Code plugin | `plugin/skills/**`, `plugin/_refs/**` |
| Claude Code direct | `CLAUDE.md`, `.claude/skills/**` |
| Codex attached repo | `AGENTS.md` |
| Codex native | `codex/skills/**` |
| Cursor | `AGENTS.md`, generated `.cursor/rules/sdcorejs-agent.mdc` |
| GitHub Copilot | `.github/copilot-instructions.md`, `.github/chatmodes/sdcorejs.chatmode.md` |

## Repo Layout

```text
skills/                 source skills, 24 dispatchable skill files
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

## Mandatory Behavior

- Runtime-localized output: respond in the user's language and preserve locale-specific marks.
- Non-trivial skills apply `_refs/shared/project-context.md` before executing so direct triggers load summaries, resume checkpoints, specs/plans, tasks, and relevant memories.
- Non-trivial execution tasks use `_refs/shared/tasklist.md`: create a visible `Tasks` section before work starts, update it as work progresses, and disclose skipped verification, blockers, and risks.
- Long or interruptible tasks mirror that progress to `.sdcorejs/tasks/current-session.md` so another context window or AI can resume.
- Requirements before code: use `sdcorejs-brainstorming` until blockers are confirmed.
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
