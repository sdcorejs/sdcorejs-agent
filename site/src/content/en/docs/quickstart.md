---
slug: quickstart
title: Get started
description: Choose an installation path, keep references with skills and check dispatch in a fresh agent session.
kicker: Quickstart
---

## Before installation

You need a compatible AI coding agent host and a target project you are authorized to read. The skill pack does not provide an agent runtime or server. These docs describe the `main` snapshot at `ac820d7`; `0.8.0` is repository/plugin metadata, not an npm package to install.

For team adoption, pin a reviewed revision or a verified tag/release. If you follow floating `main`, record the commit in use. Read the target project instructions before adding an entrypoint.

## Claude Code plugin

These commands come from the repository README:

```text
/plugin marketplace add sdcorejs/sdcorejs-agent
/plugin install sdcorejs-agent@sdcorejs
```

Open the target project and start a fresh Claude Code session. Use the read-only prompt below to check dispatch. Actual installation verification depends on host version and permissions; this page does not claim that live compatibility has passed.

## Codex native skills

Clone the source into a separate folder, then select a revision. This example pins the snapshot documented here:

```powershell
git clone https://github.com/sdcorejs/sdcorejs-agent.git
cd sdcorejs-agent
git checkout ac820d70bd247a04f977aab9bbb864f6a054acb7
```

The repository already contains a generated mirror in `codex/skills/`. Keep the entire tree, including `_refs`, when installing it into Codex’s skills folder. Review existing files with the same names before updating an installed pack; `Copy-Item -Force` replaces matching content.

```powershell
$dest = if ($env:CODEX_HOME) {
  Join-Path $env:CODEX_HOME "skills"
} else {
  Join-Path $HOME ".codex\skills"
}
New-Item -ItemType Directory -Force $dest | Out-Null
Copy-Item .\codex\skills\* $dest -Recurse -Force
```

Restart Codex, open the **target project** and run the smoke prompt. When editing canonical skills/refs in the source, the README requires regeneration with `npm run sync:skills`, followed by `npm run check:skills`; installing the existing mirror does not require source edits.

## Attached repository, Cursor and Copilot

| Adoption path | Sources to retain | Notes |
| --- | --- | --- |
| Codex attached repository | `AGENTS.md`, `skills/`, `_refs/` | A clone in the workspace does not prove the host read its instructions; an actual entrypoint/attachment is required |
| Cursor | `AGENTS.md`, `.cursor/rules/sdcorejs-agent.mdc` and refs | Integrate with target project conventions; do not overwrite existing instructions |
| GitHub Copilot | `.github/copilot-instructions.md`, `.github/chatmodes/sdcorejs.chatmode.md` and refs | Select an entrypoint/mode supported by the current client and verify it in a real session |

The repository has [submodule and symlink examples](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/README.md#attached-repo--submodule). Those symlink commands use a Unix shell; Windows needs an equivalent mechanism. Avoid copying an entrypoint without its references.

## First check

In a new session, use this prompt before assigning code changes:

```text
Use sdcorejs-explore in summary-read mode to understand this repository.
Do not write files. State the stack, relevant instructions, existing
verification commands and anything that remains unverified.
```

Look for read-only Explore routing, repository sources and a distinction between available commands and commands actually run. A missing or stale summary calls for targeted reads; it does not authorize creating a summary file.

Then try a scope request:

```text
I want to add a status filter to the Product list.
Use the SDCoreJS flow to clarify scope and propose a spec.
Preserve the existing API and components; do not write code before my approval.
```

Look for context inspection, questions about actual blockers and a scope/spec presented for approval. An "implement" command does not automatically replace spec and plan approval.

## Check the source pack when needed

Run these commands in the **skill-pack repository**, not the target application:

```bash
npm ci
npm run check:skills
npm run check:text-hygiene
npm run test:e2e:repository
```

Root tooling requires Node `^22.22.3 || ^24.15.0 || >=26.0.0`. The site requires Node `>=22.12.0`. Full E2E needs a prepared environment; read TESTING before assuming every project must run the same checks.

## Next steps

Choose a [workflow for your situation](/docs/workflows/), then follow the [feature recipe](/docs/recipes/feature/) through a complete change. If skills do not load or `_refs` is missing, read [troubleshooting](/docs/troubleshooting/).

Installation and tooling sources: [README](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/README.md), [package.json](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/package.json), [TESTING.md](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/TESTING.md).
