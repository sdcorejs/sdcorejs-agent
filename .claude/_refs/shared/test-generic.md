# Generic Test Reference

> Stack-neutral fallback for plain framework applications and unknown projects.

## Contents

- [Boundary](#boundary)
- [Runner discovery](#runner-discovery)
- [Test design](#test-design)
- [Output](#output)

## Boundary

Use this ref for `plain-angular`, `plain-nestjs`, `plain-nextjs`, React, and
`general`. Do not enforce Core UI components, SDCoreJS providers, route shapes,
database libraries, locale policy, folder layout, or build-website behavior.

## Runner discovery

The existing runner is authoritative:

| Ecosystem | Signals to inspect |
|---|---|
| Node | `package.json`, lockfile, workspace config, runner config, CI |
| Python | `pyproject.toml`, `pytest.ini`, `tox.ini`, requirements, CI |
| Java | `pom.xml`, `build.gradle*`, wrapper files, CI |
| .NET | `*.sln`, `*.csproj`, `global.json`, CI |
| Go | `go.mod`, `Makefile`, CI |
| Rust | `Cargo.toml`, workspace configuration, CI |

Reuse the discovered command, cwd, helpers, factories, fixtures, cleanup, and
reporter. Do not invent a package manager or translate every project into npm.

## Test design

Map current requirements and risks to the smallest useful level:

- pure branches and transformations: unit;
- component interaction and accessibility: component;
- database, adapter, queue, or service boundary: integration;
- HTTP contract, authorization, and tenant isolation: API e2e;
- critical user journey: browser e2e;
- acceptance sign-off: UAT/manual evidence.

Follow nearby naming, imports, lifecycle, and assertion style. Prefer observable
behavior over implementation details. Add retry, idempotency, performance, or
external-effect cases only when required or risk-justified. Preserve project
thresholds if they exist; never create a universal threshold.

## Output

Return v2 `test_context`, independent `test_status`, append-oriented
`test_evidence`, the requirement/risk coverage matrix, commands and cwd,
cleanup outcome, blockers, and artifact classification.
