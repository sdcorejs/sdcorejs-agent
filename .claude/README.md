# `.claude/` — Claude Code native integration

This folder mirrors the source-of-truth skills (`skills/angular-portal/*.md` and `skills/_shared/*.md`) into Claude Code's native `.claude/skills/<name>/SKILL.md` format.

The mirror lets Claude Code dispatch skills automatically via its built-in skill-discovery mechanism, in addition to reading the high-level `CLAUDE.md` at the repo root.

## Layout

```
.claude/
├── README.md              ← this file
├── skills/                ← native mirror (23 SKILL.md files)
│   ├── angular-portal-onboarding/SKILL.md
│   ├── angular-portal-brainstorm/SKILL.md
│   └── … (one folder per skill)
├── settings.json          ← (gitignored, local user settings)
└── sync-skills.sh         ← regenerate the mirror from skills/*.md
```

## Maintenance

The source of truth is `skills/<track>/*.md`. After editing any source skill, run:

```bash
bash .claude/sync-skills.sh
```

…to refresh the `.claude/skills/` mirror.

DO NOT edit `.claude/skills/<name>/SKILL.md` directly — it gets overwritten.

## Why mirror instead of symlink?

Symlinks are unreliable on Windows. Per-skill `SKILL.md` is small enough (~3-10 KB each, 23 files total ≈ 200 KB) that the duplication cost is negligible. Read once at session start; cached.
