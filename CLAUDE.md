# SDCoreJS SDLC Agent - Claude Code Instructions

Claude Code entry point for the SDCoreJS skill pack. The same skill model is mirrored to Codex, Cursor, and Copilot through their entry files.

This repo provides Runtime-localized SDLC skills for:

- Angular portals with `@sdcorejs/angular`
- NestJS + Postgres backends
- Next.js public sites
- A product track for PO-facing docs plus feature ledgers and traceability
- A design track for FE handoff artifacts from product user stories
- A first-class test track
- A generic execution harness for unsupported stacks or non-track plans

## Skill Source Language

Author this skill pack in English only. `skills/**`, `_refs/**`, prompts,
templates, examples, generated mirrors, and validation fixtures must not embed
Vietnamese prose or Vietnamese-only sample UI text. Runtime localization belongs
to the consuming project/session: instructions may say to translate or localize
output at runtime, but the reusable skill source itself stays English and
locale-neutral. Use placeholders such as `<localized label>` instead of concrete
Vietnamese labels.

## Dispatch

At session start, glob `skills/**/*.md`, excluding `_refs/**`, and read frontmatter only. Match user requests against each skill `description`. Read the selected skill body before acting.

If several skills match, choose the earliest workflow owner:

1. `sdcorejs-brainstorming`
2. `sdcorejs-spec`
3. `sdcorejs-plan`
4. `sdcorejs-execute-plan`
5. track executor / review / test / utility skill

## Workflow

```text
Request
  -> sdcorejs-brainstorming
       Explore open direction, then confirm all blockers.
  -> sdcorejs-spec
       Write spec + approval gate + approved spec snapshot.
  -> sdcorejs-plan
       Write plan + approval gate + approved plan snapshot.
  -> sdcorejs-execute-plan
       Detect track and always ask sequential vs parallel.
  -> executor
       angular: sdcorejs-angular
       nestjs:  sdcorejs-nestjs
       nextjs:  sdcorejs-nextjs
       product: sdcorejs-product
       design:  sdcorejs-design
       test:    sdcorejs-test
       generic: execute-plan harness fallback
  -> finish gate and tail chain
```

Tail chain after code generation:

```text
sdcorejs-test
-> sdcorejs-review
-> sdcorejs-repair-loop when findings exist
-> sdcorejs-documentation (comment-code mode)
-> sdcorejs-product when user-visible feature traceability is needed
-> sdcorejs-ship (verify-before-done mode)
-> sdcorejs-ship (branch-ready mode)
-> _refs/orchestration/tail/auto-docs.md
-> sdcorejs-documentation (write-user-guide mode)
-> _refs/orchestration/tail/auto-task-tracker.md
-> sdcorejs-explore (memories mode) when durable knowledge surfaced
```

`sdcorejs-execute-plan` must ask the user whether to run sequentially or in parallel before execution. Parallel execution requires `sdcorejs-parallel-dispatch`, which owns both the safety verdict and safe fan-out / role-split execution.

## Track Executors

| Track | Executor | References |
|---|---|---|
| angular | `sdcorejs-angular` | `_refs/angular/write-code/*`, `_refs/angular/core-docs-fetch.mjs` |
| nestjs | `sdcorejs-nestjs` | `_refs/nestjs/write-code/*`, `_refs/nestjs/core-catalog.md` |
| nextjs | `sdcorejs-nextjs` | `_refs/nextjs/build-website/write-code/*` |
| product | `sdcorejs-product` | `product/` PRDs/user stories/AC/UAT docs plus `.sdcorejs/docs/product/` traceability ledgers |
| design | `sdcorejs-design` | `design/` flows/specs/wireframes/PNG exports plus `.sdcorejs/docs/design/` traceability |
| test | `sdcorejs-test` | `_refs/shared/testing-philosophy.md`, `_refs/<track>/test-*.md`; `test/` for solution-root e2e/UAT |
| documentation | `sdcorejs-documentation` | `_refs/documentation/*` |
| generic | `sdcorejs-execute-plan` | approved plan + project scripts |

The product track is first-class. Feature docs, user stories, acceptance criteria, UAT, and traceability audits are not routed through the generic harness.

The design track is first-class. FE handoff specs, flows, wireframes, mockups, and PNG previews are not routed through the generic harness.

`sdcorejs-solution-builder` creates one solution root with `product/`, `design/`, `backend/`, `frontend/`, `test/`, and `.sdcorejs/`. Human-readable PO/QC docs live in `product/`; design handoff lives in `design/`; agent logs, approved snapshots, ledgers, memories, tasks, and verification evidence stay in `.sdcorejs/`.

The test track is first-class. Test-only plans are not routed through app write-code skills.

## Mandatory Execution Discipline

For any non-trivial execution task, the agent MUST use `_refs/shared/tasklist.md`.

Create the `Tasks` section before work starts and update it as work progresses.

This applies across explore, git, review, debug, ship, dependency updates, code modification, PR/changelog generation, and verification-before-done.

Do not say "done", "ready", or "safe to ship" unless verification is complete or skipped verification is explicitly disclosed.

## Mandatory Rules

1. **Requirements before code.** Use `sdcorejs-brainstorming` until the minimum blockers for the detected track are confirmed.
2. **Approval gates.** `sdcorejs-spec` and `sdcorejs-plan` require explicit user approval. Silence is not approval.
3. **Approved snapshots.** `sdcorejs-spec` and `sdcorejs-plan` write their own approved snapshots before the next phase.
4. **Execute-plan.** Approved plans go through `sdcorejs-execute-plan`; it owns track detection, product routing, design routing, test routing, generic fallback, and the sequential/parallel question.
5. **Finish gate.** Every code-generation run presents the finish gate before tail steps, even direct one-line requests.
6. **Evidence before claims.** Never claim pass, built, fixed, or done without running and reading the relevant verification command in the current turn.
7. **Runtime-localized.** Respond in the user's language; preserve locale-specific marks; keep identifiers and route paths in English.
8. **Mojibake guard.** Treat encoding corruption as blocking in docs, skills, prompts, comments, and user-facing strings.
9. **Target project writes.** Auto-docs, snapshots, memories, user guides, and task trackers write to the target project, never this agent repo unless this repo is the explicit target.
10. **Core UI first.** Angular generation prefers documented `@sdcorejs/angular` components.
11. **Choice prompts.** Before asking the user to choose, approve, answer yes/no, or select a mode, apply `_refs/shared/user-choice-prompt.md`; ask one decision at a time and number every option as `1/2/3/...`.
12. **Skill source language.** Keep reusable skill/ref source in English only; translate generated output at runtime based on the consumer's language.
13. **Do not author new skills without explicit user approval.**

## Session Context

At the start of a target-project session, load:

- `_refs/shared/project-context.md` for the current request
- `_refs/shared/user-choice-prompt.md` before choices, approval gates, yes/no prompts, or mode selections
- Latest 3 `.sdcorejs/docs/<track>/*.md`
- `.sdcorejs/memories/<track>/*.md` frontmatter
- `.sdcorejs/specs/<track>/*.md` frontmatter
- `.sdcorejs/plans/<track>/*.md` frontmatter
- `.sdcorejs/tasks/current-session.md` when present, prioritizing `in_progress` or `blocked`
- `.sdcorejs/persona.md` when present

## Skill Groups

| Group | Skills |
|---|---|
| SDLC | `sdcorejs-brainstorming`, `sdcorejs-spec`, `sdcorejs-plan` |
| Execution | `sdcorejs-execute-plan`, track executors, `sdcorejs-product`, `sdcorejs-design`, `sdcorejs-test` |
| Parallel | `sdcorejs-parallel-dispatch`; workspace isolation lives in `sdcorejs-git (workspace mode)` |
| Finish | `sdcorejs-ship (verify-before-done mode)`, `sdcorejs-ship (branch-ready mode)`, `_refs/orchestration/tail/auto-docs.md`, `sdcorejs-documentation (write-user-guide mode)`, `_refs/orchestration/tail/auto-task-tracker.md`, `sdcorejs-explore (memories mode)` |
| Utilities | `sdcorejs-explore`, `sdcorejs-git`, `sdcorejs-review`, `sdcorejs-debug`, `sdcorejs-ship`, `sdcorejs-documentation` |

## Mirrors

Source of truth lives in `skills/` and `_refs/`.

Generated mirrors:

- `.claude/skills/`
- `plugin/skills/`
- `codex/skills/`
- `.cursor/rules/sdcorejs-agent.mdc`

Run `npm run sync:skills` after editing source skills, `_refs`, or `AGENTS.md`.
