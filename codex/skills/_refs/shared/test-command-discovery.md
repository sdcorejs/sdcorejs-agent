# Test Command Discovery

## Contents

- [Principle](#principle)
- [Signals](#signals)
- [Selection](#selection)
- [Installation guard](#installation-guard)
- [Evidence](#evidence)

## Principle

The Existing project command is the source of truth. Discover the runner,
workspace/cwd, config, and supported filters before running or recommending
anything. Do not invent a script, runner, service, package manager, or command.

## Signals

Inspect lockfiles and workspace files, then manifests, runner configs, CI, local
docs, and nearby tests:

| Ecosystem | Common discovery signals |
|---|---|
| Node | `package.json`, `pnpm-workspace.yaml`, lockfiles, Jest/Vitest/Angular/Cypress/Playwright configs |
| Python | `pyproject.toml`, `pytest.ini`, `tox.ini`, requirements |
| Java | `pom.xml`, `build.gradle`, `gradlew` |
| .NET | `*.sln`, `*.csproj`, `global.json` |
| Go | `go.mod`, `Makefile` |
| Rust | `Cargo.toml`, workspace metadata |
| Robot | `*.robot`, `*.resource`, variable files, `robot.yaml` |

In a monorepo, identify the owning workspace and correct working directory.
Root and package scripts are not interchangeable. Preserve wrapper commands,
environment setup, reporters, and filters already used in CI.

## Selection

Prefer:

1. an existing focused command for the case/file;
2. an existing package/workspace command with a supported filter;
3. the owning project's existing suite command;
4. the full suite only when focused execution is unavailable or required.

Record uncertainty as a blocker. A generic plan may use
`<existing-test-command>`; executable output must use a discovered command.

## Installation guard

Do not run dependency-changing or browser-installing commands without explicit
approval for the exact command and reason. This includes install/add commands,
browser binary installers, downloading exec/dlx probes, config bootstrap, and
`npx --yes`. Missing tooling is a blocker, not permission to install.

## Evidence

Record command, cwd, runner, config path, package manager or ecosystem,
environment references, exit code, and `associated_HEAD_or_diff`. Summarize
redacted output; do not retain raw sensitive logs.
