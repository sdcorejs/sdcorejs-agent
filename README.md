# SDCoreJS

> An orchestrated SDLC for AI coding agents. Works in Claude Code, GitHub Copilot, and Codex.

SDCoreJS turns Claude Code, GitHub Copilot, and Codex into accountable engineers on your stack. Requests flow through **clarify → spec → plan → write code → review → ship**, with user-approval gates between each phase and a documented audit trail.

Three first-class tracks, each with stack-specific conventions, generators, reviews, and tests:

- **Angular Portal** — backoffice portals built on [`@sdcorejs/angular`](https://www.npmjs.com/package/@sdcorejs/angular) (Core UI, Angular 19 / 20 / 21)
- **NestJS** — modular APIs with Postgres + DTOs + permissions
- **Next.js** — public sites with bilingual content, SEO, ISR caching

The system ships as **dispatchable skills** — markdown with YAML frontmatter — that AI coding tools match against intent and execute in order. No runtime, no CLI, no compiler; just the workflow layer your AI coding tool was missing.

## How it works

1. You clone or attach this repo's `skills/` and entry-point files (`CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md`, `.github/chatmodes/sdcorejs.chatmode.md`) to your target project.
2. The AI tool reads the entry-point at session start.
3. When you ask the tool to do something ("tạo entity product", "review module catalog"), it matches your request against each skill's `description` and follows the matched skill's instructions exactly.

## Tracks

| Track | Path | Status |
| --- | --- | --- |
| Angular | `skills/tracks/angular/` | ✅ Complete (`angular-onboarding` + `angular-write-code` orchestrator; Core UI reference docs in `_refs/angular/`) |
| NestJS | `skills/tracks/nestjs/` | 🟡 Scaffold (onboarding + plan-walking `nestjs-write-code`; design + review + testing usable) |
| Next.js | `skills/tracks/nextjs/build-website/` | ✅ Complete (`nextjs-build-website-*`: onboarding, write-code orchestrator, audit-existing-site) |

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
05-write-plan                    ← step-by-step plan
06-review-plan             ← user reviews + approves plan
07-write-code              ← orchestrator that dispatches sub-skills (10-31)
40-e2e-test                ← write E2E tests for what was built
sdcorejs-review-code       ← self-review against conventions (auto-detects track; color-coded tables)
orchestration/comment-code ← MANDATORY ASK gate: skip / simple / medium / full (all applied inline)
  ↓
orchestration/auto-docs    ← MANDATORY: summary to target project's .sdcorejs/docs/<track>/
orchestration/memories     ← when learning durable knowledge: target project's .sdcorejs/memories/<track>/
```

For Angular Portal, `07-write-code` is the single orchestrator; it loads on-demand reference packs from `_refs/angular/write-code/` (no frontmatter, not dispatchable skills): `init-portal`, `init-module`, `init-entity`, `screen-list`, `screen-detail` (CREATE / UPDATE / DETAIL states + reactive-form refinement), `actions` (workflow / bulk / custom side-effects).

## Mandatory rules (every track)

1. **Auto-docs** at the end of every code-writing task → writes to your **target project's** `.sdcorejs/docs/<track>/<YYYY-MM-DD-HH-mm>-<topic>.md`. Read at session start to recall prior work.
2. **Memories** when the agent learns durable knowledge (a convention, a stakeholder constraint, an anti-pattern) → writes to **target project's** `.sdcorejs/memories/<track>/<topic>.md`. Indexed at session start.
3. **Bilingual** — Vietnamese request → Vietnamese output (full diacritics). English → English. Permission codes + route paths stay English.
4. **Clarify-before-code** — agent refuses to generate code without module ownership / entity name / key fields.
5. **Core UI first** (Angular Portal) — use `@sdcorejs/angular` components; otherwise skeleton + `alert('TODO: ...')` stubs.
6. **Test after generation** — run framework tests and report.
7. **Evidence before claims** — the agent never says something passes / builds / is fixed / is done without running the verifying command in the same turn and reading its output. Applies to its own work and any subagent's report.

## Quick start in a target project

### Option 1 — Claude Code plugin (recommended for Claude Code users)

Install via the Claude Code plugin marketplace. The repo ships its own single-plugin marketplace at `.claude-plugin/marketplace.json`, so you only need to add the repo as a marketplace and install the plugin:

```
/plugin marketplace add sdcorejs/sdcorejs-agent
/plugin install sdcorejs-agent@sdcorejs
```

After install, all 43 skills (cross-track SDLC + angular / nestjs / nextjs tracks + orchestration + review + testing) are dispatched automatically by Claude Code based on each skill's `description` trigger.

### Option 2 — git submodule (works for Claude Code + Copilot + Codex)

```bash
cd <your-portal-project>
git submodule add <repo-url> .sdcorejs-agent
ln -s .sdcorejs-agent/CLAUDE.md CLAUDE.md
ln -s .sdcorejs-agent/AGENTS.md AGENTS.md
ln -s .sdcorejs-agent/skills skills-sdcorejs
```

### Option 3 — copy entry points + skills

```bash
cp -r <agent-repo>/{CLAUDE.md,AGENTS.md,skills} ./
```

Then open the project in Claude Code / Copilot / Codex and start describing what you want.

## Tool support priority

1. **Claude Code** — primary target. Two paths:
   - Plugin marketplace (`/plugin marketplace add sdcorejs/sdcorejs-agent`) — recommended; reads `plugin/skills/<name>/SKILL.md`
   - Direct repo attach — reads `CLAUDE.md` + `.claude/skills/<name>/SKILL.md`
2. **GitHub Copilot** — reads `.github/copilot-instructions.md` + `.github/chatmodes/sdcorejs.chatmode.md`
3. **Codex / Cursor / OpenAI Agents SDK** — reads `AGENTS.md`

All paths follow the same `skills/**/*.md` source of truth (kept in sync by `.claude/sync-skills.sh` — both Claude Code mirrors are auto-regenerated on every commit that touches `skills/`). The entry-point files differ only in framing.

## Repo layout

```
sdcorejs-agent/
├── CLAUDE.md                              # Claude Code entry (direct-attach mode)
├── AGENTS.md                              # Codex/Cursor entry
├── README.md                              # this file
├── LICENSE
├── .github/
│   ├── copilot-instructions.md            # GitHub Copilot entry
│   └── chatmodes/sdcorejs.chatmode.md     # Copilot chat mode
├── .claude-plugin/
│   └── marketplace.json                   # single-plugin marketplace manifest
├── plugin/                                # Claude Code plugin distribution
│   ├── .claude-plugin/plugin.json         # plugin manifest (name/version/author)
│   ├── skills/<name>/SKILL.md             # auto-synced from skills/ source
│   └── _refs/<track>/...                  # auto-synced from top-level _refs/
├── .claude/
│   ├── skills/<name>/SKILL.md             # project-local Claude Code mirror (auto-synced)
│   └── _refs/<track>/...                  # auto-synced from top-level _refs/
├── _refs/                                 # source of truth — reference data per track (one tree, mirrored once)
│   ├── angular/                    # core-version, catalog, entity-field-types, templates/, sdcorejs-angular/...
│   ├── nestjs/                            # architecture-principles
│   ├── nextjs/build-website/              # architecture-principles
│   └── sdlc/                              # cross-track design-phase patterns ({angular,nestjs,nextjs}.md)
├── skills/                                # source of truth — flat .md per skill
│   ├── tracks/
│   │   ├── angular/                # ✅ 2 skills (onboarding + write-code orchestrator; 6 reference packs in _refs/angular/write-code/)
│   │   ├── nestjs/                        # 🟡 scaffold
│   │   └── nextjs/build-website/          # ✅ 13 skills
│   ├── shared/{sdlc,conventions,workflow}/
│   ├── orchestration/                     # SDLC plumbing (13 skills)
│   ├── review/{architecture,code,security,performance,accessibility}/
│   └── testing/{philosophy,tdd,e2e,integration,unit}/
└── images/
```

The two synced mirrors (`plugin/skills/` for plugin distribution + `.claude/skills/` for project-local Claude Code) are regenerated from `skills/` by `.claude/sync-skills.sh`, enforced via the lefthook pre-commit hook. Edit only the `skills/` source — never the mirrors directly.

## Not a multi-agent framework

This is not LangChain / AutoGPT / DeepAgents. There is no runtime, no orchestration code, no LLM calls. It is a curated set of markdown files that AI coding tools read and follow. The "agent" lives inside Claude Code / Copilot / Codex — this repo just gives it knowledge of the SDCoreJS stack.

## License

MIT
