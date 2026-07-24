---
schema_version: 2
kind: project-summary
generated_at: 2026-07-24T14:34:58+07:00
generator: sdcorejs-explore
target_root_kind: sdcorejs-agent-authoring-repo
tracks: [workflow, angular, nestjs, nextjs, product, design, test]
stack_profiles: [node-esm, markdown-skill-pack, astro-site]
summary_scope: skill-pack architecture, mirrors, adapters, and verification
source_roots: [_refs, plugin, scripts, site, skills, test]
evidence:
  workspace_configs: []
  package_manifests: [package.json, site/package.json]
  key_entrypoints: [scripts/sync-skills.mjs, bin/sdcorejs-agent.mjs]
fingerprints:
  workspace_structure: sha256:906a06a701cde74f2c95fcd722a40f1e16e5b1f58c99713e0be73a15003de2b7
  dependency_manifests: sha256:8120b551be7728a304a459e6f0a18769e8d3cfea558299e6ab3d9ef455ea1e73
  source_roots: sha256:ddec7e2dffa8a69905218e58e710cd58376cd3cbc4dc15fc1d809fc8a6e2ec12
redaction_applied: true
artifact_id: project-summary
artifact_kind: summary
change_ref: shared-project-index
source_spec: none
source_plan: none
commit_policy: conditional
owner: integration-owner
---

# Project Summary

## Purpose

`sdcorejs-agent` is an authoring repository for a portable SDLC skill pack.
It defines reusable workflows for AI coding agents working with Angular,
NestJS, Next.js, product, design, test, documentation, review, ship, Git,
Docker, authentication, run guides, and generic execution.

The repository publishes the same canonical behavior through adapters for
Codex, Claude Code, Cursor, GitHub Copilot, and the packaged plugin surface.
Source instructions stay English-only; consuming agents localize responses and
generated project artifacts at runtime.

## Read First

- `AGENTS.md` is the cross-tool entrypoint and repository policy.
- `MIRROR_POLICY.md` defines canonical files and generated mirrors.
- `skills/orchestration/using-skills.md` owns session dispatch.
- `_refs/shared/project-context.md` owns read-oriented context assembly.
- `_refs/shared/artifact-lifecycle.md` owns durable artifact classification.
- `_refs/shared/tasklist.md` keeps execution progress in runtime state.
- `package.json` lists synchronization, test, hygiene, audit, and site commands.

Read only the references selected by a skill. Do not load every reference pack
for routine work.

## Stack and Workspace

- Repository tooling uses Node.js ESM and requires Node.js 18 or newer.
- The root package is private and uses npm.
- Most source assets are Markdown instructions plus small JavaScript helpers.
- Tests use the built-in Node.js test runner.
- The documentation site is an Astro workspace under `site/`.
- Git hooks are installed through Lefthook during package preparation.
- No package-manager workspace declaration couples the root and site packages.

Dependency evidence:

- Root tooling: `package.json` and `package-lock.json`.
- Site tooling: `site/package.json` and `site/package-lock.json`.
- Site configuration: `site/astro.config.mjs` and `site/tsconfig.json`.

## Application and Module Map

| Area | Path | Responsibility | Entry point | Depends on |
|---|---|---|---|---|
| Skill sources | `skills/` | Canonical routing and executor contracts | `skills/orchestration/using-skills.md` | `_refs/` |
| Reference sources | `_refs/` | Shared procedures, templates, and track packs | `_refs/shared/project-context.md` | source skills |
| Sync pipeline | `scripts/` | Validate and generate adapter mirrors | `scripts/sync-skills.mjs` | `skills/`, `_refs/` |
| CLI adapter | `bin/` | Expose the pack to command-line consumers | `bin/sdcorejs-agent.mjs` | canonical sources |
| Plugin adapter | `plugin/` | Package skills, refs, hooks, and manifest | `plugin/hooks/session-start` | generated mirrors |
| Claude adapter | `.claude/` | Generated Claude skills and references | `.claude/skills/` | sync pipeline |
| Codex adapter | `codex/skills/` | Generated Codex skills and references | `codex/skills/` | sync pipeline |
| Cursor adapter | `.cursor/rules/` | Generated repository rule | `.cursor/rules/sdcorejs-agent.mdc` | `AGENTS.md` |
| Copilot adapter | `.github/` | Copilot instructions and chat mode | `.github/copilot-instructions.md` | canonical policy |
| Contract tests | `test/e2e/` | Routing, mirror, protocol, and golden tests | `test/e2e/skill-pack-runner.test.mjs` | all pack surfaces |
| Documentation site | `site/` | Public skill-pack documentation | `site/src/pages/index.astro` | published behavior |
| Durable context | `.sdcorejs/` | Approved specs, plans, docs, memories, summary | `.sdcorejs/summary.md` | lifecycle rules |

## Entrypoints and Main Runtime Flows

Authoring flow:

1. Edit canonical instructions in `skills/`, `_refs/`, or top-level entrypoints.
2. Run `scripts/sync-skills.mjs` through `npm run sync:skills`.
3. The sync script validates source skills and regenerates tool-specific mirrors.
4. Contract tests exercise routing, generated content, adapters, and fixtures.
5. `npm run check:skills` reconstructs mirrors in a temporary directory and
   reports drift without modifying the repository.

Consumer flow:

1. A tool loads its adapter entrypoint.
2. Dispatch selects one canonical skill by name and description.
3. The skill loads only the references needed for its mode and detected stack.
4. Write-producing work passes runtime artifact context through the finish gate.
5. Ship verifies evidence; Git computes artifact closure before explicit staging.

## Source-of-Truth and Generated Boundaries

Canonical, hand-edited sources:

- `skills/**`
- `_refs/**`
- `AGENTS.md`
- `CLAUDE.md`
- `.github/copilot-instructions.md`
- `.github/chatmodes/sdcorejs.chatmode.md`
- plugin hook and manifest sources

Generated surfaces:

- `.claude/skills/**`
- `.claude/_refs/**`
- `plugin/skills/**`
- `plugin/_refs/**`
- `codex/skills/**`
- `codex/skills/_refs/**`
- `.cursor/rules/sdcorejs-agent.mdc`

Never repair mirror drift by editing generated files directly. Change the
canonical source and rerun synchronization.

## Commands

- `npm run sync:skills` regenerates all mirrors.
- `npm run check:skills` checks mirror parity without repository writes.
- `npm test` runs repository, NestJS contract, and golden-project suites.
- `npm run test:e2e:repository` runs repository-level contract tests.
- `npm run test:e2e:nestjs` runs NestJS pack contract and generation tests.
- `npm run test:e2e:nestjs:golden` validates the generated golden project.
- `npm run check:text-hygiene` checks encoding and source-language hygiene.
- `npm run check:nestjs-pack` performs NestJS pack-specific checks.
- `npm run build:site` builds the Astro documentation site.
- `npm run check:audit` audits root production dependencies.
- `npm run check:site:audit` audits site production dependencies.

## Conventions and Invariants

- Canonical skill sources use `name:` and `description:` frontmatter.
- Reusable skill and reference prose is English-only and locale-neutral.
- User-facing runtime output follows the user's language.
- Approval gates separate brainstorming, spec, plan, and execution.
- Non-trivial execution uses a runtime task list; no mutable session checkpoint
  belongs in the repository.
- Project context assembly is read-only unless a distinct artifact write is
  explicitly authorized.
- Summary freshness uses bounded architecture, dependency, and source-root
  fingerprints rather than branch or commit identity.
- Durable `.sdcorejs/**` producers declare ownership and commit policy.
- Parallel workers do not mutate shared summary, memory, or backlog artifacts.
- Git stages explicit paths only after artifact closure succeeds.
- Verification evidence is required before completion or ship claims.
- Mojibake and reusable non-English prose are blocking defects.

## Task-to-Path Navigation

| Task | Start path | Follow-up evidence |
|---|---|---|
| Change dispatch behavior | `skills/orchestration/using-skills.md` | adapter entrypoints |
| Change project context | `_refs/shared/project-context.md` | `_refs/shared/project-context.mjs` |
| Change artifact closure | `_refs/shared/artifact-lifecycle.md` | `_refs/shared/artifact-lifecycle.mjs` |
| Change an SDLC gate | `skills/shared/sdlc/` | `_refs/sdlc/` |
| Change Angular generation | `skills/tracks/angular/` | `_refs/angular/` |
| Change NestJS generation | `skills/tracks/nestjs/` | `_refs/nestjs/` |
| Change Next.js generation | `skills/tracks/nextjs/` | `_refs/nextjs/` |
| Change product/design/test | `skills/tracks/` | matching track references |
| Change finish behavior | `_refs/shared/finish-gate.md` | `_refs/orchestration/tail/` |
| Change mirror generation | `scripts/sync-skills.mjs` | `MIRROR_POLICY.md` |
| Add repository contracts | `test/e2e/` | support fixtures and adapters |
| Change public documentation | `site/src/` | `npm run build:site` |

## Known Unknowns

- Some consumer environments expose extra graph or search providers; detect
  them from target-project configuration before use.
- Optional infrastructure tooling varies by generated target and must be
  inferred from that target rather than this authoring repository.
- Generated target applications may use libraries outside the SDCoreJS stack;
  project context must report actual evidence instead of assuming a profile.

## Refresh Triggers

Refresh this summary only when durable project structure changes:

- source roots, workspace boundaries, or adapter boundaries are added or removed;
- dependency manifests materially change the detected stack or commands;
- canonical/generated ownership changes;
- primary entrypoints or synchronization flows move;
- a named architecture owner explicitly approves a shared index refresh.

Ordinary feature edits, unrelated commits, verification results, and live work
progress do not require a summary refresh.
