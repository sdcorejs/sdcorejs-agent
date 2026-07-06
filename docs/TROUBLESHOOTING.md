# Troubleshooting

Use this page when installation, mirrors, validation, or entrypoint behavior
does not match expectations.

## Mirror Drift

Symptom:

```text
FAIL codex/skills/ is OUT OF SYNC
```

Fix:

```bash
npm run sync:skills
npm run check:skills
```

Do not edit generated mirrors by hand. Edit source files under `skills/`,
`_refs/`, and entrypoints, then regenerate mirrors.

## Missing Codex Refs

Symptom:

```text
Codex skill cannot load ../_refs/...
```

Fix:

- Copy the entire `codex/skills` folder, not only individual skill folders.
- Keep `codex/skills/_refs` beside the native Codex skills.
- Run `npm run check:skills` before copying.

## Malformed Codex Skill Path

Symptom:

```text
Generated Codex instructions mention ..//SKILL.md
```

Fix:

```bash
npm run sync:skills
npm run test:e2e:phase1
```

Phase 1 tests assert that generated Codex skill guidance uses
`../<skill-name>/SKILL.md`.

## Hidden Unicode Hygiene Failure

Symptom:

```text
Text hygiene check failed. Remove hidden/control/bidi Unicode characters:
```

Fix:

- Open the reported file and remove the exact character at `line:column`.
- Re-type the affected line manually if the character is invisible.
- Re-run `npm run check:text-hygiene`.

Allowed whitespace is tab, LF, and CR. Bidi controls, zero-width characters,
soft hyphen, unexpected BOM, and other control characters are blocked.

## Package Manager Confusion

The canonical validation path is npm:

```bash
npm ci
npm run check:text-hygiene
npm run check:skills
npm run test:e2e
```

The root package is private and is not published to npm. Do not switch docs or
CI to Yarn unless the package metadata and lockfile are intentionally changed.

## Full E2E Has No Runs

Symptom:

```text
The Full E2E workflow exists, but GitHub Actions shows no successful runs.
```

Fix:

1. Open the `Full E2E` workflow in GitHub Actions.
2. Run it with `workflow_dispatch`, or wait for the scheduled run.
3. Confirm the run uses the intended commit.
4. Link the successful run in release notes.

Local equivalent:

```bash
SDCOREJS_E2E_FULL=1 npm run test:e2e:phase4
```

On Windows PowerShell:

```powershell
$env:SDCOREJS_E2E_FULL = "1"
npm run test:e2e:phase4
```

If local Full E2E fails at `docker compose up` with a
`dockerDesktopLinuxEngine` pipe error, Docker CLI is installed but the Docker
Desktop Linux daemon is not running. Start Docker Desktop, confirm `docker info`
shows a `Server` section without connection errors, then re-run phase 4.

## Plugin Install Issues

Symptom:

```text
Plugin install succeeds, but skills are missing or stale.
```

Fix:

- Re-run `npm run sync:skills`.
- Verify `plugin/skills/**` and `plugin/_refs/**` changed as expected.
- Reinstall the plugin from a tagged release or the intended branch.
- Restart the host tool after installation.

## Cursor Or Copilot Uses Old Instructions

Fix:

```bash
npm run sync:skills
git diff -- .cursor/rules .github/copilot-instructions.md .github/chatmodes
```

Cursor rules are generated from `AGENTS.md`. Copilot entrypoints are source
entrypoints and should be reviewed when workflow rules change.

## Deterministic Tests Pass But Live Agent Behavior Differs

Deterministic prompt routing is not live-agent proof. Capture a sanitized
transcript using `docs/REAL_AGENT_VALIDATION.md` and update fixtures only when
the expected behavior is clearly defined.
