# `.claude/` — Claude Code native integration

This folder mirrors the source-of-truth skills (`skills/tracks/angular-portal/*.md` and `skills/orchestration/ + skills/shared/ + skills/review/ + skills/testing/*.md`) into Claude Code's native `.claude/skills/<name>/SKILL.md` format.

The mirror lets Claude Code dispatch skills automatically via its built-in skill-discovery mechanism, in addition to reading the high-level `CLAUDE.md` at the repo root.

## Layout

```
.claude/
├── README.md              ← this file
├── skills/                ← native mirror (auto-generated, do NOT hand-edit)
│   ├── angular-portal-onboarding/SKILL.md
│   ├── sdcorejs-commit/SKILL.md
│   └── … (one folder per skill, named after `name:` frontmatter)
├── settings.json          ← gitignored, local user settings
└── sync-skills.sh         ← regenerate / check the mirror
```

## ⚠️ Source of truth is `skills/<track>/*.md`

Edit skills under `skills/tracks/<stack>/`, `skills/orchestration/`, `skills/shared/`, `skills/review/`, `skills/testing/`.
NEVER hand-edit `.claude/skills/<name>/SKILL.md` — it is overwritten on every sync.

## Three ways the mirror stays in sync

### 1. Automatic on commit (recommended)

`lefthook.yml` ships a pre-commit hook that regenerates and stages the mirror whenever you commit a change under `skills/`. Install once:

```bash
npm install                 # installs lefthook devDep
npx lefthook install        # writes .git/hooks/pre-commit
```

After that, you never have to remember to run the sync script — it runs for you.

### 2. Manual

```bash
npm run sync:skills           # or: bash .claude/sync-skills.sh
```

### 3. CI / pre-merge check

```bash
npm run check:skills          # or: bash .claude/sync-skills.sh --check
```

Exits non-zero if the mirror is out of sync. Wire this into CI to catch PRs that edited `skills/` without regenerating the mirror.

## Cleaning up

If a source skill was deleted and the mirror still has a stale folder:

```bash
bash .claude/sync-skills.sh --clean
```

## Why mirror instead of symlink?

- Symlinks unreliable on Windows
- Per-skill `SKILL.md` ≈ 3–10 KB; whole mirror ≈ 200 KB — negligible
- Mirror is read by Claude Code at session start; cached after

## Why not edit `.claude/skills/` directly?

- Concern-based layout (`skills/tracks/<stack>/` + `skills/orchestration/` + `skills/shared/` + `skills/review/` + `skills/testing/`) gives clear workflow ordering via numeric prefixes (`00-onboarding.md`, `07-write-code.md`, `52-faq.md`) — the flat `.claude/skills/<name>/SKILL.md` layout doesn't.
- GitHub Copilot and Codex read `skills/<track>/*.md` directly — Claude Code is the only tool needing the mirror.
- Single source = single review surface in PRs.
