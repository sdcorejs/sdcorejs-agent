# `.claude/` - Claude Code Native Integration

This folder mirrors the source-of-truth skills (`skills/**/*.md`) into Claude Code's native `.claude/skills/<name>/SKILL.md` format.

The mirror lets Claude Code dispatch skills automatically via built-in skill discovery, in addition to reading the high-level `CLAUDE.md` at the repo root.

## Layout

```text
.claude/
├── README.md              <- this file
├── skills/                <- native mirror, generated
│   ├── sdcorejs-angular/SKILL.md
│   ├── sdcorejs-dev-workflow/SKILL.md
│   └── ...
├── _refs/                 <- shared reference mirror
├── settings.json          <- gitignored local settings
├── sync-skills.sh         <- Git Bash wrapper
└── sync-skills.ps1        <- PowerShell wrapper
```

## Source Of Truth

Edit only:

- `skills/**/*.md`
- `_refs/**`
- `AGENTS.md` for Cursor rule content

Do not hand-edit `.claude/skills/<name>/SKILL.md`; it is overwritten by sync.

## Sync

`scripts/sync-skills.mjs` is the cross-platform implementation. It generates:

- `.claude/skills/` and `.claude/_refs/` for Claude Code direct attach
- `plugin/skills/` and `plugin/_refs/` for Claude Code plugin install
- `codex/skills/` plus `codex/skills/_refs/` for Codex native skills
- `.cursor/rules/sdcorejs-agent.mdc` for Cursor

Commands:

```bash
npm run sync:skills
npm run check:skills
npm run clean:skills
```

PowerShell wrappers are also available:

```powershell
npm run sync:skills:ps
npm run check:skills:ps
npm run clean:skills:ps
```

## Why Mirror?

- Symlinks are unreliable on Windows.
- Claude, Codex, Cursor, and Copilot need different entrypoint or metadata shapes.
- A generated mirror gives each runtime the layout it expects while keeping one source review surface.
