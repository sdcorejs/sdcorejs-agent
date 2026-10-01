---
slug: versions
title: Versions & evidence
description: Read capabilities by source revision; distinguish main, candidate and actual validation of the runtime you use.
kicker: Sources & status
---

## The snapshot these docs describe

Default content follows `main` at commit **`ac820d70bd247a04f977aab9bbb864f6a054acb7`**, verified from the remote on 1 October 2026. This is a main snapshot, not a claim about a published GitHub Release/tag. Repository/plugin metadata is `0.8.0`; the root workspace is private and validation-only, with no root npm-package installation path.

This snapshot has 23 canonical public skills. Internal authoring skills are not counted as public capabilities. The site build reads inventory from `skills/` and checks it against the editorial references; missing or extra references fail the build.

## How do main and candidate differ?

| Source | Status in these docs | Adoption approach |
| --- | --- | --- |
| Main `ac820d7` | Basis of the default guides | Actual readiness still needs checks in the target session |
| `codex/simplify-design-handoff`, `4703643432f7eda43a1c9ccb19db6669e56575f3` | Separate candidate, excluded from default claims | Review its diff/source and evidence before adoption |

The candidate changes simplify verification, design handoff/verification, UI review/interaction finish contracts, progressive skill/reference loading and repair/readiness contracts. A file/contract existing on a branch does not prove all implementation checks passed or that it was released.

This docs rewrite does not import the candidate, modify runtime skills or incorporate the separate findings-repair patch. Reference pages link to main source; keep the candidate revision and corresponding report separate when reviewing it.

[Compare the main snapshot → candidate](https://github.com/sdcorejs/sdcorejs-agent/compare/ac820d70bd247a04f977aab9bbb864f6a054acb7...4703643432f7eda43a1c9ccb19db6669e56575f3).

## Which evidence layers are available?

The repository provides deterministic contract tests, Full E2E for a prepared environment and a format for live-agent evidence. These are validation capabilities; the docs do not claim that every layer ran on your machine or host.

- A passing validator/offline fixture proves the case that ran, not current provider/model compatibility.
- A screenshot proves a capture at that time, not keyboard or screen-reader behavior.
- Agent-host support needs transcripts/tool versions and attestation from the current session.
- Model identifiers, pricing and provider API behavior need current verification when they are part of your scope.

The site makes no quantitative claims about token/cost savings, speed or success rate. Recipes are illustrative examples, not verified execution demos.

## Primary sources

- [README & installation](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/README.md)
- [AGENTS.md & routing/scope](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/AGENTS.md)
- [System registry & artifact roots](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/_refs/shared/system-registry.json)
- [AI-agent engines/capability manifest](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/_refs/ai-agent/manifest.json)
- [Validation posture](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/VALIDATION.md)
- [Real-agent evidence format](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/docs/REAL_AGENT_VALIDATION.md)

## When updating the docs

Select an explicit revision, read canonical source and check commands/paths before editing prose. Update inventory and references together, run build/link checks, then inspect responsive and keyboard behavior. Do not change source-link hashes without reviewing content against the new version.
