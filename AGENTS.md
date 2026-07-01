# SDCoreJS SDLC Agent

Entry point for AGENTS.md-aware tools: Codex, Cursor, OpenAI Agents SDK, and compatible assistants.
Claude Code reads `CLAUDE.md`; Copilot reads `.github/copilot-instructions.md`.

This repo is an SDLC skill pack for:

- Angular portals using `@sdcorejs/angular`
- NestJS + Postgres backends
- Next.js public sites
- Product-track feature ledgers for PO traceability
- Design-track FE handoff artifacts
- Test-track work across those stacks
- Generic harness execution when no known track matches

All user-facing behavior is Runtime-localized: detect the user's language, respond in that language, and preserve locale-specific marks. Keep identifiers, permission codes, env keys, and route paths in English.

## Skill Source Language

Author this skill pack in English only. `skills/**`, `_refs/**`, prompts,
templates, examples, generated mirrors, and validation fixtures must not embed
Vietnamese prose or Vietnamese-only sample UI text. Runtime localization belongs
to the consuming project/session: instructions may say to translate or localize
output at runtime, but the reusable skill source itself stays English and
locale-neutral. Use placeholders such as `<localized label>` instead of concrete
Vietnamese labels.

## Skill Layout

```text
skills/
  shared/sdlc/
    01-brainstorming.md  -> sdcorejs-brainstorming
    02-spec.md           -> sdcorejs-spec
    03-plan.md           -> sdcorejs-plan
    04-execute-plan.md   -> sdcorejs-execute-plan
  orchestration/
    parallel-dispatch.md -> sdcorejs-parallel-dispatch
    documentation.md, repair-loop.md, ...
  tracks/
    angular/sdcorejs-angular.md
    nestjs/sdcorejs-nestjs.md
    nextjs/sdcorejs-nextjs.md
    product/sdcorejs-product.md
    design/sdcorejs-design.md
    test/sdcorejs-test.md
  shared/workflow/explore.md -> sdcorejs-explore
  shared/workflow/review.md -> sdcorejs-review
  shared/workflow/ship.md -> sdcorejs-ship
  shared/workflow/git.md -> sdcorejs-git
_refs/
  angular/, nestjs/, nextjs/, sdlc/, shared/, infra/, orchestration/, documentation/
  shared/tdd.md -> loaded by sdcorejs-test (tdd mode)
```

Dispatch by `name:` frontmatter and the `description:` trigger. Load only frontmatter at session start; read a skill body only after selecting that skill.

## Workflow

```text
Request
  -> sdcorejs-brainstorming
       Explore only when direction is open; otherwise confirm blockers.
  -> sdcorejs-spec
       Write spec, self-review, ask for approval, persist approved spec.
  -> sdcorejs-plan
       Write numbered plan, self-review, ask for approval, persist approved plan.
  -> sdcorejs-execute-plan
       Detect executor track and always ask sequential vs parallel.
  -> executor
       angular: sdcorejs-angular
       nestjs:  sdcorejs-nestjs
       nextjs:  sdcorejs-nextjs
       product: sdcorejs-product
       design:  sdcorejs-design
       test:    sdcorejs-test
       generic: execute-plan harness fallback
  -> finish gate and tail chain
       sdcorejs-test -> sdcorejs-review -> repair-loop -> sdcorejs-documentation (comment-code mode)
       -> sdcorejs-product when user-visible feature traceability is needed
       -> sdcorejs-ship (verify-before-done mode) -> sdcorejs-ship (branch-ready mode) -> _refs/orchestration/tail/auto-docs.md
       -> sdcorejs-documentation (write-user-guide mode) -> _refs/orchestration/tail/auto-task-tracker.md -> sdcorejs-explore (memories mode) when relevant
```

`sdcorejs-execute-plan` always asks the user whether to run sequentially or in parallel before execution. If the user chooses parallel, it must run `sdcorejs-parallel-dispatch`, which owns both the safety verdict and safe fan-out / role-split execution.

## Tracks

| Track | Executor | Notes |
|---|---|---|
| angular | `sdcorejs-angular` | Loads `_refs/angular/write-code/*` packs, Core UI first |
| nestjs | `sdcorejs-nestjs` | Loads `_refs/nestjs/write-code/*`, `@sdcorejs/nestjs` core catalog first |
| nextjs | `sdcorejs-nextjs` | Loads `_refs/nextjs/build-website/write-code/*` packs |
| product | `sdcorejs-product` | Writes/audits `product/` PRDs/user stories/AC/UAT docs plus `.sdcorejs/docs/product/` feature ledgers |
| design | `sdcorejs-design` | Writes/audits `design/` FE handoff specs, flows, wireframes, and PNG previews |
| test | `sdcorejs-test` | First-class track for unit/integration/e2e/UAT plans; solution-root cross-stack tests live in `test/` |
| generic | `sdcorejs-execute-plan` harness | Executes approved plans for unsupported stacks or non-track work |

## Production SDLC Scope Decision

Current approved scope is a verified, locally runnable SDLC skill pack: product/design/test evidence, Angular/NestJS/Next.js code generation, Docker compose packaging, Keycloak auth, run guides, branch hygiene, PR/changelog support, and recovery memory.

Do **not** add new production-SDLC skills or refs for CI/CD pipelines, IaC, staging/production promotion, observability, incident response, SRE runbooks, migration rollout, compliance gates, or release governance until the user explicitly approves that expansion. If requested, start with `sdcorejs-brainstorming` and an approved spec/plan before authoring new skill/ref surfaces.

## Mandatory Execution Discipline

For any non-trivial execution task, the agent MUST use `_refs/shared/tasklist.md`.

Create the `Tasks` section before work starts and update it as work progresses.

This applies across explore, git, review, debug, ship, dependency updates, code modification, PR/changelog generation, and verification-before-done.

Do not say "done", "ready", or "safe to ship" unless verification is complete or skipped verification is explicitly disclosed.

## Mandatory Rules

1. Project context first when needed: read `.sdcorejs/summary.md` or invoke `sdcorejs-explore`.
2. Requirements before code: use `sdcorejs-brainstorming` until minimum blockers are confirmed.
3. Approval gates: `sdcorejs-spec` and `sdcorejs-plan` require explicit approval. Silence is not approval.
4. Approved snapshots: `sdcorejs-spec` and `sdcorejs-plan` write approved snapshots themselves before the next phase.
5. Execute through `sdcorejs-execute-plan`: it owns track detection, product-track routing, design-track routing, test-track routing, generic harness fallback, and the sequential/parallel question.
6. Finish gate is mandatory after every code-generation run, including direct track executor requests.
7. Evidence before claims: never say pass, fixed, built, or done without current verification output.
8. Auto-docs and task tracking write to the target project, not to this agent repo.
9. Mojibake is a blocking defect in prompts, docs, skills, comments, and user-facing strings.
10. User choice prompts must not rely on clickable options; apply `_refs/shared/user-choice-prompt.md`, ask one decision at a time, and provide numbered choices such as `1/2/3`.
11. Skill-pack source language is English only; keep runtime-localized behavior by translating generated output to the user's language during execution, not by hardcoding Vietnamese in reusable skills or refs.
12. Do not author new skills without explicit user approval.
13. Do not expand into production SDLC skill/ref coverage without the explicit approval described in **Production SDLC Scope Decision**.

## Session-Start Ritual

In a target project:

- Apply `_refs/shared/project-context.md` for the current request.
- Read latest 3 `.sdcorejs/docs/<track>/*.md`.
- Read `.sdcorejs/memories/<track>/*.md` frontmatter.
- Read `.sdcorejs/specs/<track>/*.md` and `.sdcorejs/plans/<track>/*.md` frontmatter.
- Read `.sdcorejs/tasks/current-session.md` if present; prioritize it when status is `in_progress` or `blocked`.
- Read `.sdcorejs/persona.md` if present; otherwise default to technical style unless `sdcorejs-explore (persona mode)` is triggered.

## Reference Loading

Load references on demand:

- `_refs/shared/project-context.md` before non-trivial skill execution.
- `_refs/sdlc/{angular,nestjs,nextjs}.md` during brainstorming/spec/plan.
- `_refs/shared/tasklist.md` for non-trivial execution tasks.
- `_refs/shared/user-choice-prompt.md` before any user-facing choice, approval gate, yes/no question, or mode selection.
- `_refs/shared/testing-philosophy.md` for test-track work.
- `_refs/angular/core-docs-fetch.mjs` before using Core UI components.
- `_refs/<track>/review-*.md` during review.
- `_refs/infra/*` during dockerize/auth/run-guide.
- `_refs/orchestration/workspace-isolation.md` during `sdcorejs-git (workspace mode)`.
- `_refs/orchestration/tail/verify-before-done.md` during `sdcorejs-ship (verify-before-done mode)`.
- `_refs/orchestration/tail/branch-ready.md` during `sdcorejs-ship (branch-ready mode)`.

## Anti-Patterns

- Skipping `sdcorejs-brainstorming` because scope "looks obvious".
- Starting code before the plan approval and execute-plan parallel question.
- Treating test work as a tail-only concern; test-only plans use the `test` track.
- Treating product docs as generic docs; human docs in `product/` and traceability ledgers in `.sdcorejs/docs/product/` use the `product` track.
- Treating design as generic docs or production code; FE handoff artifacts use the `design` track and frontend implementation stays in the frontend track.
- Running parallel work without the parallel-dispatch gate.
- Writing `.sdcorejs/*` session artifacts into `sdcorejs-agent` when the target project is elsewhere.

## Solution Builder Output

`sdcorejs-solution-builder` creates one solution root:

```text
<solution-root>/
  product/     # PRDs, user stories, acceptance criteria, UAT, decisions
  design/      # flows, specs, wireframes, optional PNG exports
  backend/     # NestJS app and backend tests
  frontend/    # Angular app and frontend tests
  test/        # cross-stack e2e/UAT tests, fixtures, reports
  .sdcorejs/   # specs, plans, session docs, ledgers, memories, tasks
```
