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

The sync also regenerates each adapter's `sdcorejs-harness.json`. A source or
content hash, capability, action, or per-skill mapping mismatch is mirror drift,
not a file to repair by hand.

## Native Choice Or Delegation Is Missing

Capability `unknown` is deliberately conservative. The harness must use
numbered Markdown for interaction and sequential parent execution for
delegation/isolation unless the runtime proves native support.

- Inspect the adapter's generated `sdcorejs-harness.json`.
- Confirm the client actually exposes the native surface in the current
  session.
- Run `npm run test:e2e:harness`.
- Do not change `unknown` to `supported` from product documentation alone;
  capture current runtime evidence.

Per-agent model override is optional. When unavailable, inherit the parent
model rather than blocking the task.

## Static Visual Output

The shipped companion is a static composer, not a local server. It always
includes a numbered Markdown fallback and keeps the written response
authoritative.

- Do not add remote scripts, telemetry, arbitrary HTML, or a half-configured
  socket/event bridge.
- Treat generated HTML as temporary/local-only unless the user asks to save it.
- If scripts are disabled, use the visible Markdown fallback.
- A visual selection is feedback, not implementation approval.

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

Current generated Codex mirrors should instead mention:

```text
../<skill-name>/SKILL.md
```

Fix:

```bash
npm run sync:skills
npm run test:e2e:phase1
```

Phase 1 tests assert that generated Codex skill guidance uses
`../<skill-name>/SKILL.md` and does not contain `..//SKILL.md`.

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

The private root Node workspace uses npm only as its development and validation
toolchain; the root project is not distributed through npm. Do not switch docs
or CI to Yarn unless the tooling manifest and lockfile are intentionally
changed.

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

## Communication Economy Policy Looks Too Verbose Or Too Sparse

The Communication Economy Policy resolves to `compact`, `standard`, or
`detailed`. Ask explicitly for one of those profiles, or ask for `full context`
when diagnosing a context transfer. Compact output must still use complete
professional sentences.

If routine success is verbose, check that the caller renders the user
projection instead of echoing the authoritative runtime context. Also check
that progress updates are event-driven and that a final progress summary is not
immediately repeated by the final response.

If an approval, security warning, destructive action, ambiguity, failed
verification, or blocker is too terse, treat it as a resolver or caller defect:
those cases must automatically use `detailed`. A compact preference cannot
remove exact scope, consequence, recovery, evidence, or required decision.

If downstream context is missing, inspect the adapter declaration for
`runtime_context_channel`. Only evidence of a structured runtime transfer may
mark it `supported`; `unsupported` and `unknown` must use the portable handoff.
Do not treat conversation memory or hidden provider state as a portable
fallback. Run:

```bash
npm run test:e2e:communication-economy
npm run report:communication-economy
```

The deterministic report reads baseline schema surfaces from its declared
commit and measures sanitized contract projections, not captured transcripts or
live model usage. Metrics are evidence, not a marketing claim. Record
unavailable live telemetry as skipped rather than estimating token counts.
