---
generated_at: 2026-07-24T01:59:39+07:00
git_head: cfa7a985e364e99b39a7ed236593649335f00fdf
branch: refactor/sdcorejs-product-final
tracks: [generic, workflow, product, test]
generator: sdcorejs-explore
---

# Project Summary - sdcorejs-agent

## What this project is

`sdcorejs-agent` is an SDLC skill-pack authoring repository. It defines reusable
skills and references for Angular, NestJS, Next.js, product, design, test,
documentation, review, ship, Git, and orchestration workflows.

## Stack and active track

- Repository tooling uses Node.js ESM with Windows PowerShell parity checks.
- The active work is the R23 clean finalization of the `sdcorejs-product`
  contract refactor.
- The final branch is rebuilt from `origin/main` in an isolated worktree.
- Execution is sequential; parallel dispatch and subagents are inactive.

## Architecture map

- `skills/` and `_refs/` are canonical authoring sources.
- `.claude/`, `plugin/`, `codex/skills/`, and
  `.cursor/rules/sdcorejs-agent.mdc` are generated mirrors.
- `_refs/product/product-protocol.mjs` is the executable product-contract
  authority and validation boundary.
- `test/e2e/product-protocol.test.mjs` provides focused product protocol and
  mutation coverage.
- `test/e2e/skill-pack-runner.test.mjs` and its support module exercise
  repository-level dispatch and contract behavior.
- `site/` is the documentation showcase and has an independently audited
  dependency graph.

## Reusable building blocks

- `npm run sync:skills` regenerates mirrors from canonical sources.
- `npm run check:skills` and `npm run check:skills:ps` verify mirror parity.
- `npm run test:e2e:product` is the focused product protocol suite.
- `npm run test:e2e:repository` and `npm run test:e2e` are the repository and
  aggregate verification gates.
- `npm run check:audit`, `npm run check:site:audit`, and
  `npm run build:site` cover the production dependency and site-build surface.

## Conventions detected

- Reusable skill-pack source is English-only and locale-neutral.
- Canonical sources are edited before generated mirrors.
- Approved requirement and plan authority is file-backed and fail-closed.
- Product readiness separates implementation, verification, and UAT evidence.
- Parent-observed one-shot capabilities bind final authorization to current
  state and reject missing, forged, stale, or replayed decisions.
- A content write after final traceability sync invalidates all later evidence.

## Current R23 projection

- Source checkpoint:
  `ea9ae0b3fe77c7c51fed4abcc7316ff23afbd9da`.
- Clean base:
  `cfa7a985e364e99b39a7ed236593649335f00fdf`.
- Included implementation projection: 44 canonical source paths plus 91
  generated mirrors.
- Approved same-R23 repair exception: `site/package.json` and
  `site/package-lock.json`.
- Excluded recovery/history projection: 40 paths, including all R16-R22
  recovery-only artifacts.
- Allowed closeout projection: this summary, one workflow closeout, five human
  product documents, and one canonical product ledger.
- The final expected Git path set is 145 paths.

## Current verification

The latest complete closure passed product 80/80, phase 1 124/124, parallel
86/86, repository 220/220, aggregate repository 220/220, focused NestJS 24
passed with one intentional Linux-only skip, generated projects 2/2, both
mirror checks, text hygiene, NestJS pack validation, root and site production
audits, and the two-page Astro build. The complete review has no unresolved
Critical or Important finding.

## Open context

- R23 tasks 1-8 are complete.
- Task 9 is producing compact pre-traceability documentation.
- Task 10 will write the five human product documents and canonical ledger; the
  ledger must be the final content write.
- Tasks 11-13 will run deny-write verification and read-only audit/ship gates,
  stage the exact approved set, then commit, push, and open the pull request.
- No branch-ready or delivery claim is valid until those remaining tasks pass.

## Freshness

Generated against base commit
`cfa7a985e364e99b39a7ed236593649335f00fdf` on branch
`refactor/sdcorejs-product-final` before the final R23 traceability write.
