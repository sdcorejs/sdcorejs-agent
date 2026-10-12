# Shared agent reference

This repository-owned reference supplements root AGENTS.md. Load the relevant sections when executing a track or finish chain; root approval, ownership, language and production-scope rules remain authoritative. The retained CLAUDE.md remains the provenance source for these consolidated details.

## Explicit finish tail

Tail chain after code generation:

```text
sdcorejs-test
-> optional sdcorejs-simplify
-> affected focused tests after any simplification write
-> sdcorejs-review
-> sdcorejs-repair-loop when findings exist
-> sdcorejs-documentation (code-documentation mode)
-> sdcorejs-product when user-visible feature traceability is needed
-> _refs/orchestration/tail/auto-docs.md
-> sdcorejs-documentation (write-user-guide mode)
-> _refs/orchestration/tail/auto-task-tracker.md when the sequential/integration owner updates durable backlog
-> sdcorejs-explore (memories mode) when durable knowledge surfaced
-> sdcorejs-explore (conventions-sync-write-approved) when convention candidates exist and policy or explicit authority permits persistence
-> authorized current-task cleanup and affected verification
-> sdcorejs-ship (verify-before-done mode)
-> sdcorejs-ship (branch-ready mode as the final read-only gate)
```

## Track Executors

| Track | Executor | References |
|---|---|---|
| angular | `sdcorejs-angular` for Core UI portals; generic harness for plain Angular | `_refs/angular/write-code/*`, `_refs/angular/core-docs-fetch.mjs` only for `@sdcorejs/angular` / `@sd-angular/core`, new SDCoreJS portal creation, or approved Core UI migration |
| nestjs | `sdcorejs-nestjs` | `_refs/nestjs/write-code/*`, `_refs/nestjs/core-catalog.md` |
| nextjs | `sdcorejs-nextjs` | `_refs/nextjs/build-website/write-code/*` |
| ai-agent | `sdcorejs-ai-agent` | `_refs/ai-agent/**`; two engine profiles and twelve independent capability profiles |
| product | `sdcorejs-product` | `.sdcorejs/product/` PRDs/user stories/AC/UAT docs plus `.sdcorejs/docs/product/` traceability ledgers |
| design | `sdcorejs-design` | `.sdcorejs/design/` flows/specs/wireframes/PNG exports/references plus `.sdcorejs/docs/design/` traceability |
| test | `sdcorejs-test` | `_refs/shared/testing-philosophy.md`, `_refs/<track>/test-*.md`; an existing shared `test/` project for multi-project e2e/UAT |
| documentation | `sdcorejs-documentation` | `_refs/documentation/*` |
| generic | `sdcorejs-execute-plan` | approved plan + project scripts |

The product track is first-class. Feature docs, user stories, acceptance criteria, UAT, and traceability audits are not routed through the generic harness.

The design track is first-class. FE handoff specs, flows, wireframes, mockups, and PNG previews are not routed through the generic harness.

Product and Design artifacts always live under the target repository's
`.sdcorejs/` directory. Canonical roots come from `artifact_roots` in
`_refs/shared/system-registry.json` and are resolved through
`_refs/shared/artifact-paths.mjs`. Root-level `product/**` and `design/**` are
legacy read-only compatibility inputs, never write targets.

The test track is first-class. Test-only plans are not routed through app write-code skills.

The AI-agent track is first-class but approved-plan-only. It authors governed
application contracts/integration with provider storage disabled by default,
business-shaped tools, exact-input approvals, tenant-isolated state,
evidence/tracing/FinOps contracts, offline deterministic evals, and separately
reported live verification. It does not bundle an agent runtime.

## Skill Groups

| Group | Skills |
|---|---|
| SDLC | `sdcorejs-brainstorming`, `sdcorejs-spec`, `sdcorejs-plan` |
| Execution | `sdcorejs-execute-plan`, `sdcorejs-ai-agent`, other track executors, `sdcorejs-product`, `sdcorejs-design`, `sdcorejs-test` |
| Delegated execution | `sdcorejs-subagent-driven-development`; `sdcorejs-parallel-dispatch` schedules safe waves; workspace isolation is a provider-neutral orchestration action |
| Finish | `_refs/orchestration/tail/auto-docs.md`, `sdcorejs-documentation (write-user-guide mode)`, `_refs/orchestration/tail/auto-task-tracker.md`, `sdcorejs-explore (memories mode)`, `sdcorejs-explore (conventions-sync-write-approved)`, `sdcorejs-ship (verify-before-done mode)`, `sdcorejs-ship (branch-ready mode as the final read-only gate)` |
| Utilities | `sdcorejs-cleanup`, `sdcorejs-simplify`, `sdcorejs-explore`, `sdcorejs-git`, `sdcorejs-review`, `sdcorejs-debug`, `sdcorejs-ship`, `sdcorejs-documentation` |

## Mirrors

Source of truth lives in `skills/` and `_refs/`.

Generated mirrors:

- `.claude/skills/`
- `plugin/skills/`
- `codex/skills/`
- `.cursor/rules/sdcorejs-agent.mdc`

Run `npm run sync:skills` after editing source skills, `_refs`, or `AGENTS.md`.

## Provider entrypoint detail

At session start, glob `skills/**/*.md`, excluding `_refs/**`, and read frontmatter only. Core UI generation is limited to installed or approved Core UI portals; plain Angular retains the generic harness and local conventions. Non-English fixtures are limited to explicit dispatch/runtime-localization input tests; reusable expected skill prose remains English-only.


## Instruction provenance

Unique guidance from [CLAUDE.md](CLAUDE.md) is consolidated here. Existing AGENTS scope, approval rules and confirmed conventions remain authoritative. CLAUDE.md is retained; update shared conventions together rather than maintaining independent conflicting rules.
