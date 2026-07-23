# Generated Mirror Policy

This repository keeps source skills and generated mirrors in the same tree so
different agent tools can install the same SDLC pack.

## Canonical Sources

Edit these files directly:

- `skills/**` - source skill definitions.
- `_refs/**` - source reference instructions and templates.
- `AGENTS.md` - AGENTS.md-compatible entrypoint.
- `CLAUDE.md`, `.github/copilot-instructions.md`, and `.github/chatmodes/**`
  when the entrypoint itself needs a source change.
- `scripts/sync-skills.mjs` when mirror generation behavior changes.

## Generated Mirrors

Do not edit these by hand:

- `.claude/skills/**`
- `.claude/_refs/**`
- `plugin/skills/**`
- `plugin/_refs/**`
- `codex/skills/**`
- `codex/skills/_refs/**`
- `.cursor/rules/sdcorejs-agent.mdc`

Regenerate mirrors after any canonical source change:

```bash
npm run sync:skills
npm run check:skills
```

On Windows, also validate the PowerShell sync path when changing mirror
generation behavior:

```powershell
npm run check:skills:ps
```

## Review Rules

- Source and generated mirror diffs should be reviewed together.
- A pull request that changes `skills/**`, `_refs/**`, `AGENTS.md`, or
  `scripts/sync-skills.mjs` should include `npm run check:skills` evidence.
- If a generated mirror changes without a matching source or generator change,
  treat it as drift and regenerate from source.
- If a source change intentionally alters generated wording, add or update a
  regression test when the behavior is important for tool compatibility.
- Generated mirrors are distribution artifacts. Keep them committed, but keep
  ownership clear: source first, generator second, mirrors last.
