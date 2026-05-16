# SDCoreJS SDLC Agent

> One agent. Three stacks. Works in Claude Code, GitHub Copilot, and Codex.

This repository is an **SDLC agent** for teams building software on the SDCoreJS stack:

- **Backoffice portals** in Angular with `@sd-angular/core` (Core UI)
- **Backend** in NestJS + Postgres
- **Public sites** in Next.js (SSR)

The agent ships its capabilities as **skills** — markdown files with YAML frontmatter — that supported AI coding tools dispatch automatically when relevant. There is no runtime, no CLI, no compiler. Just skills + entry-point files that each tool reads.

## How it works

1. You clone or attach this repo's `skills/` and entry-point files (`CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md`, `.github/chatmodes/sdcorejs.chatmode.md`) to your target project.
2. The AI tool reads the entry-point at session start.
3. When you ask the tool to do something ("tạo entity product", "review module catalog"), it matches your request against each skill's `description` and follows the matched skill's instructions exactly.

## Tracks

| Track | Path | Status |
| --- | --- | --- |
| Angular Portal | `skills/angular-portal/` | ✅ Complete (21 skills + 58 reference docs for Core UI) |
| NestJS | `skills/nestjs/` | 🚧 Planned |
| Next.js | `skills/nextjs/` | 🚧 Planned |

## Workflow (per track)

Every track follows the same SDLC pipeline. Numbering reflects the order.

```
Request
  ↓
00-onboarding              ← orient the developer
01-brainstorm              ← explore requirements open-ended
02-clarify-requirements    ← hard-confirm scope (blocking questions)
03-write-spec              ← author a spec document
04-review-spec             ← user reviews + approves spec
05-plan                    ← step-by-step plan
06-review-plan             ← user reviews + approves plan
07-write-code              ← orchestrator that dispatches sub-skills (10-31)
40-e2e-test                ← write E2E tests for what was built
50-review-code             ← self-review against conventions
51-write-comments          ← add JSDoc + WHY comments
52-faq                     ← post-work Q&A
  ↓
_shared/auto-docs          ← MANDATORY: summary to target project's .sdcorejs/docs/<track>/
_shared/memories           ← when learning durable knowledge: target project's .sdcorejs/memories/<track>/
```

Sub-skills under `07-write-code` (Angular Portal): `10-init-portal`, `11-init-module`, `12-init-entity`, `20-screen-list`, `21-screen-detail`, `22-screen-create`, `23-screen-update`, `30-reactive-form`, `31-workflow-actions`.

## Mandatory rules (every track)

1. **Auto-docs** at the end of every code-writing task → writes to your **target project's** `.sdcorejs/docs/<track>/<YYYY-MM-DD-HH-mm>-<topic>.md`. Read at session start to recall prior work.
2. **Memories** when the agent learns durable knowledge (a convention, a stakeholder constraint, an anti-pattern) → writes to **target project's** `.sdcorejs/memories/<track>/<topic>.md`. Indexed at session start.
3. **Bilingual** — Vietnamese request → Vietnamese output (full diacritics). English → English. Permission codes + route paths stay English.
4. **Clarify-before-code** — agent refuses to generate code without module ownership / entity name / key fields.
5. **Core UI first** (Angular Portal) — use `@sd-angular/core` components; otherwise skeleton + `alert('TODO: ...')` stubs.
6. **Test after generation** — run framework tests and report.

## Quick start in a target project

```bash
# Option 1 — git submodule (recommended)
cd <your-portal-project>
git submodule add <repo-url> .sdcorejs-agent
ln -s .sdcorejs-agent/CLAUDE.md CLAUDE.md
ln -s .sdcorejs-agent/AGENTS.md AGENTS.md
ln -s .sdcorejs-agent/skills skills-sdcorejs

# Option 2 — copy entry points + skills
cp -r <agent-repo>/{CLAUDE.md,AGENTS.md,skills} ./

# Then open the project in Claude Code / Copilot / Codex and start describing what you want.
```

## Tool support priority

1. **Claude Code** — primary target (reads `CLAUDE.md`)
2. **GitHub Copilot** — reads `.github/copilot-instructions.md` + `.github/chatmodes/sdcorejs.chatmode.md`
3. **Codex / Cursor / OpenAI Agents SDK** — reads `AGENTS.md`

All three follow the same `skills/<track>/<numbered>.md` source. The entry-point files differ only in framing.

## Repo layout

```
sdcorejs-agent/
├── CLAUDE.md                              # Claude Code entry
├── AGENTS.md                              # Codex/Cursor entry
├── README.md                              # this file
├── LICENSE
├── .github/
│   ├── copilot-instructions.md            # GitHub Copilot entry
│   └── chatmodes/sdcorejs.chatmode.md     # Copilot chat mode
├── skills/
│   ├── _shared/                           # cross-track skills
│   │   ├── auto-docs.md                   # mandatory session summary
│   │   └── memories.md                    # durable knowledge capture
│   ├── angular-portal/                    # ✅ complete
│   │   ├── 00-onboarding.md
│   │   ├── 01-brainstorm.md
│   │   ├── 02-clarify-requirements.md
│   │   ├── … (21 skills total)
│   │   ├── _refs/sdcorejs-angular/        # 58 reference docs for Core UI components/forms/services
│   │   └── _shared/                       # track-specific shared rules (if any)
│   ├── nestjs/                            # 🚧
│   └── nextjs/                            # 🚧
├── _legacy/                               # pre-pivot content kept for reference
└── images/
```

## Not a multi-agent framework

This is not LangChain / AutoGPT / DeepAgents. There is no runtime, no orchestration code, no LLM calls. It is a curated set of markdown files that AI coding tools read and follow. The "agent" lives inside Claude Code / Copilot / Codex — this repo just gives it knowledge of the SDCoreJS stack.

## License

MIT
