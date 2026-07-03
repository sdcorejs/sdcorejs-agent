---
generated_at: 2026-07-02T09:45:00+07:00
git_head: 04650df77e5242e83514e2658659e0d47b2982f6
branch: feat/documentation-docstring-capability
tracks: [generic]
generator: sdcorejs-explore
---

# Project Summary - sdcorejs-agent

## What this project is

`sdcorejs-agent` is an SDLC skill-pack authoring repository. It defines reusable
skills and references for AI coding agents that work with Angular portals,
NestJS backends, Next.js sites, product/design/test tracks, documentation,
review, ship, git, and orchestration flows.

## Stack & track

- Primary runtime for repository tooling: Node.js ESM.
- Active project track for skill-pack edits: generic.
- Package scripts:
  - `npm run sync:skills` mirrors source skills and refs.
  - `npm run check:skills` verifies generated mirrors are in sync.
  - `npm test` runs `node --test test/e2e/*.test.mjs`.

## Architecture map

- `skills/` contains source skill definitions.
- `_refs/` contains source reference instructions and templates loaded by skills.
- `codex/skills/`, `plugin/`, and `.claude/` contain generated mirrors.
- `.cursor/rules/sdcorejs-agent.mdc` is generated from `AGENTS.md`.
- `scripts/sync-skills.mjs` owns mirror generation and check mode.
- `test/e2e/` contains skill-pack, adapter, entrypoint, and golden target app tests.

## Reusable building blocks

- `skills/orchestration/documentation.md` routes documentation modes.
- `_refs/documentation/` contains detailed documentation behavior refs.
- `test/e2e/support/skill-pack-runner.mjs` validates skill routing keywords and mirrors.
- `scripts/sync-skills.mjs` should be used instead of hand-editing generated mirrors.

## Conventions detected

- Source skill/ref prose is English-only.
- Runtime localization is described by instructions, not by hard-coded localized source prose.
- Generated mirrors must not be edited directly.
- New non-trivial work uses `.sdcorejs/docs`, `.sdcorejs/specs`, `.sdcorejs/plans`, and `.sdcorejs/tasks/current-session.md`.

## Reuse cheatsheet

- Edit source skill files under `skills/`.
- Add reusable references under `_refs/`.
- Run `npm run sync:skills` after source skill/ref edits.
- Run `npm run check:skills`, `npm test`, and relevant hygiene checks before reporting completion.

## Open context

- Current branch: `feat/documentation-docstring-capability`.
- Current approved plan: `.sdcorejs/plans/generic/2026-07-02-09-43-docstring-documentation-capability.md`.
- Current task: add `docstring` mode to `sdcorejs-documentation`.

## Freshness

Generated from commit `04650df77e5242e83514e2658659e0d47b2982f6` on branch
`feat/documentation-docstring-capability`.
