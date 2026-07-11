---
generated_at: 2026-07-11T08:46:48+07:00
git_head: 41a369e3d7fad9d77002c33ab8a2bb3f075d1404
branch: feat/nestjs-skill-hardening
tracks: [generic, nestjs]
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
- Active project track for skill-pack authoring: generic, with the current
  approved contract targeting the NestJS skill/reference surface.
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
- `skills/tracks/nestjs/sdcorejs-nestjs.md` is the canonical NestJS executor
  orchestrator; `_refs/nestjs/` owns its reusable authoring packs.

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

- Current branch: `feat/nestjs-skill-hardening`.
- Current approved spec:
  `.sdcorejs/specs/nestjs/2026-07-11-07-37-nestjs-skill-hardening.md`.
- Current approved plan:
  `.sdcorejs/plans/nestjs/2026-07-11-08-00-nestjs-skill-hardening.md`.
- Current task: harden `sdcorejs-nestjs` generation, security, tenancy, runtime
  defaults, behavioral golden projects, and bounded validation evidence.
- Sequential implementation and verification are complete. The branch is at the
  final read-only review/ship gate before commit, push, and pull request creation.

## Freshness

Generated from commit `41a369e3d7fad9d77002c33ab8a2bb3f075d1404` on branch
`feat/nestjs-skill-hardening`. Refresh after branch HEAD changes materially.
