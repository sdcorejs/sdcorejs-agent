---
name: sdcorejs-solution-builder
description: One-door orchestrator for non-technical PO/QC users who ask to build a whole runnable app or system. Delegates existing skills end-to-end: persona, brainstorming, spec/plan approvals, product/design, backend/frontend/test build, dockerize, auth, run guide, verification, docs/tasks. Creates one solution root; not for isolated changes. Runtime-localized.
allowed-tools: Read, Write, Edit, Bash, Glob
---

# Solution Builder - One Door, Whole App


## Shared Protocols

Before executing this skill:
1. Read and apply `_refs/shared/tasklist.md` for non-trivial execution tasks.
2. Read and apply `_refs/shared/persona.md` if a project persona exists.
3. Read and apply `_refs/shared/project-context.md` for project memory, resume checkpoints, summaries, specs/plans, tasks, and relevant memories.
4. Current user request, current files, diffs, logs, failing tests, and command output override stored context.

## Purpose

One conversation, one running app. The user describes - in plain words - the software they want; this skill drives the whole pipeline that turns that idea into a packaged, verified full-stack application (backend + screens + login + one-command start). The user never touches architecture, never names a module, and only needs the final run guide.

For a non-tech owner the promise is: *describe what you want -> the pack builds it, packages it, verifies the startup path, and tells you the one command to run it.* Everything technical happens behind the scenes; the user only reacts to plain-language checkpoints and, at the end, runs the app.

This skill is a conductor. It **composes** the existing skills in order - it does not reimplement any of them. Each step delegates to the skill that owns that work.

## Production SDLC boundary

This skill delivers a verified, locally runnable solution root and supporting evidence. It does **not** create production-SDLC surfaces such as CI/CD pipelines, IaC, environment promotion, observability, incident response, SRE runbooks, migration rollout, compliance gates, or release governance. Do not add new skills or refs for those areas from this flow unless the user explicitly approves that scope expansion and the normal brainstorming -> spec -> plan gates capture it.

## When invoked / NOT

**Invoked when:**
- Any trigger above: "build me an app / a system", "I want software that does X", "make a tool to manage Y", "build the whole thing", "vibe code an app".
- A non-technical request for a **whole piece of software** - someone describes an application in their own domain terms (e.g. "I need something to manage my warehouse - stock in, stock out, low-stock alerts") without any technical detail. This is the default front door for that audience.

**NOT for:**
- A single isolated change. Route straight to the specific skill instead of spinning up the whole chain - e.g. "add one endpoint" -> `sdcorejs-nestjs`; "add a column to the list screen" -> `sdcorejs-angular`; "dockerize what I already have" -> `sdcorejs-dockerize`. Tell the user the smaller skill is the better fit.
- A developer who is clearly driving the granular flow themselves (already invoking `sdcorejs-spec`, `sdcorejs-plan`, `sdcorejs-execute-plan`, or the per-track executors). Step aside and let them - see **## Tech users**.

## Step 0 - persona

Before anything else, set the audience.

1. Run / read `sdcorejs-explore (persona mode)`. This front door **defaults to NON-TECH framing** - the entry triggers (someone describing software in domain terms) signal a PO/QC owner, so when persona is unset, present the non-tech path as the default.
2. Load `_refs/shared/persona.md` and apply the matching contract for the rest of the conversation.

Non-tech means, for every later step:
- **Plain language** - no unexplained jargon; explain what a step does and how to react, in the user's own words.
- **Hide the mechanics** - never narrate skill names or pipeline internals to the user ("now running repair-loop" is forbidden). Report progress as outcomes ("the screens are built and checked"). Skill names in this document stay in parentheticals **for maintainers only**.
- **Feature + UI framing** - talk about what the software does and what the user will see; never about modules, entities, tables, or APIs.
- **Forced infra defaults** - the generated software is always: **Angular** frontend, **NestJS** modular-monolith backend, **Keycloak** auth, **Postgres**, packaged as **docker-compose** (one `docker compose up`); the generated backend uses the **`simple`** NestJS profile (single-tenant, role-based login) - the user is never asked about multi-tenancy, permission matrices, or architecture; and a **single solution-root** topology (one folder with sibling `product/`, `design/`, `backend/`, `frontend/`, `test/`, plus `.sdcorejs/` - NOT a monorepo `base/shared` kernel, NOT separate published packages). The non-tech door never asks about repository layout. The user is not asked to choose any of these.

## Solution root contract

When this skill creates a new app, all tracks write into one solution root:

```text
<solution-root>/
  product/
    prds/
    user-stories/
    acceptance-criteria/
    uat-checklists/
    decisions/
  design/
    flows/
    specs/
    wireframes/
    exports/png/
    decisions/
  backend/
  frontend/
  test/
    e2e/
    fixtures/
    reports/
    test-cases/
  docker-compose.yml
  START.md
  .sdcorejs/
    specs/
    plans/
    docs/
      product/
      design/
      nestjs/
      angular/
      test/
    memories/
    tasks/
```

Rules:
- `product/` is the human-readable PO/QC documentation set: PRDs, user stories, acceptance criteria, UAT, and decisions.
- `design/` is the FE handoff layer: flows, design specs, editable wireframes/prototypes, optional PNG exports, and design decisions derived from user stories.
- `backend/` is the NestJS app and owns backend code plus backend unit/integration tests.
- `frontend/` is the Angular app and owns UI code plus frontend unit/component tests.
- `test/` is the cross-stack test track: e2e/UAT automation, shared test cases, fixtures, and reports based on the approved user stories.
- `.sdcorejs/` remains the agent memory and evidence layer: approved specs/plans, session logs, product traceability ledgers, task tracker, memories, and verification evidence.
- Product docs and `.sdcorejs/docs/product/` are both required: product docs explain the feature to humans; the ledger maps requirement -> implementation -> test evidence for recovery and verification.
- Design docs and `.sdcorejs/docs/design/` are both allowed: design docs guide FE implementation; the ledger maps user stories -> screens -> PNG/wireframe exports.

## The chain

Drive these steps in order. For the non-tech user, narrate only the plain-language sentence - the skill named in each parenthetical is for maintainers.

1. **Understand what you want** *(`sdcorejs-brainstorming`)* - Ask the user ONLY about (a) what the software should do and (b) what they will see on screen - per persona rule 7, never about architecture, modules, entities, fields, or storage. From those answers, **derive the modules / entities / fields / data model internally**, then confirm them back as plain outcomes - e.g. "I'll store products with name, code, quantity, and price - correct?" The user reacts to a concrete proposal; they never design it. *(Maintainer note: the NestJS **profile** is forced to `simple` for this non-tech door - never surfaced. A developer who needs `enterprise` drives the granular `sdcorejs-brainstorming` flow instead.)*

2. **Write it down + check with you** *(`sdcorejs-spec` = **GATE 1**)* - Capture the agreed features and screens as a spec, then read it back plainly: "Does this match what you wanted?" **Silence is NOT approval** - wait for an explicit yes; iterate on any "no". On approval, `sdcorejs-spec` writes the approved spec snapshot itself.

3. **Plan the build + check again** *(`sdcorejs-plan` = **GATE 2**)* - Lay out the build steps and confirm again, in plain words ("Here's how I'll build it - good to go?"). Same rule: explicit approval only, silence is not consent. On approval, `sdcorejs-plan` writes the approved plan snapshot itself.

4. **Write product docs and screen design** *(`sdcorejs-product` -> `sdcorejs-design`)* - Seed `product/` and `.sdcorejs/docs/product/`, then create `design/` handoff artifacts from the approved user stories: flows, design specs, editable wireframes, and PNG exports when a renderer is available or the user asks for previews. To the user: "writing down the agreed behavior and preparing screen references before building."

5. **Build the engine room + the screens together** *(`sdcorejs-execute-plan` -> `sdcorejs-parallel-dispatch` Mode B when approved)* - Invoke the owning skill with explicit inputs: `profile=simple`, `topology=single solution-root`, `layout=product/design/backend/frontend/test/.sdcorejs`, admin-first enabled, and the approved spec/plan/design handoff. `sdcorejs-execute-plan` must still ask the user whether to run sequentially or in parallel; for this full-stack door, recommend parallel role-split unless the user prefers sequential. To the user this is just "building the part that stores your data and the screens you'll use, together, including the in-app account and role management screens." `sdcorejs-parallel-dispatch` handles contract-freeze, design/backend/frontend/product/QC role split, acceptance-loop verification, and its own build-phase tail chain.

   If subagents are unavailable, or Mode B escalates, use the sequential fallback: freeze the same contract, run `sdcorejs-nestjs` with `profile=simple` and `topology=single solution-root` under `backend/`, run `sdcorejs-angular` against the frozen contract and design handoff under `frontend/`, run `sdcorejs-test` under `test/`, then run `sdcorejs-review`, `sdcorejs-repair-loop` if needed, `sdcorejs-product` for final traceability, and `sdcorejs-ship (verify-before-done mode)`. Do not skip the same acceptance criteria just because the fallback is sequential.

6. **Record the product docs + ledger** *(`sdcorejs-product`)* - Update `product/` and `.sdcorejs/docs/product/` after implementation with implementation map, test map, UAT checklist, and open gaps. To the user: "recording what was agreed, what was built, and what still needs checking."

7. **Package it to run with one command** *(`sdcorejs-dockerize`)* - Wrap frontend + backend + database into a single runnable stack so the whole app starts with one command. To the user: "packaging it so you can run it on your machine without installing Node, Postgres, or Keycloak separately." Docker Desktop remains the one required install and belongs in `START.md`.

8. **Add login** *(`sdcorejs-auth`)* - Wire authentication (Keycloak) into the frontend and backend so the app has a real login screen and demo credentials.

9. **Write the start guide** *(`sdcorejs-run-guide`)* - Emit `START.md` - a plain, numbered guide that takes the user from a fresh machine to a running app.

10. **Verify the app + packaged stack** *(`sdcorejs-ship (verify-before-done mode)` + stack smoke)* - Re-verify the approved acceptance criteria after packaging, including any product-ledger gaps, design handoff coverage, and `test/` e2e/UAT evidence, then verify the solution root before claiming the app runs. Minimum stack checks:
   - `docker compose config` from the deploy root.
   - Build/start check: prefer `docker compose up --build -d`, then inspect service health/logs.
   - Smoke check the published frontend URL, backend health/API URL, and the login path with the demo credentials when automatable.
   - Tear down only if the run was a verification helper and the user did not ask to leave it running.

   If Docker is unavailable, a port is occupied, or the smoke cannot be automated, say exactly what was not verified and do **not** claim the packaged stack is runnable. Give the user the next concrete command from `START.md`.

11. **Record the whole build** - After packaging/auth/run-guide/stack verification, run the final tail for the solution-builder invocation: `sdcorejs-ship (branch-ready mode)` -> `_refs/orchestration/tail/auto-docs.md` -> `sdcorejs-write-user-guide` (Mode 1 for touched modules; Mode 2 aggregate if this is a whole-app delivery) -> `_refs/orchestration/tail/auto-task-tracker.md` -> `sdcorejs-explore (memories mode)` when durable knowledge surfaced. This second tail captures infra/auth/run-guide changes too; do not rely only on Mode B's build-phase tail.

12. **Tell the user how to run it** - Close in plain language only after the relevant checks above have actually run. If verified, say: "Open a terminal in this folder, type `docker compose up`, wait a moment, then open http://localhost:4200 in your browser and log in with **demo / demo**." Point them at `START.md` for the full guide and for how to stop or reset it.

## Composes, does not reimplement

This skill ONLY sequences other skills. It contains no spec-writing, code-generation, dockerizing, auth, or run-guide logic of its own - for the detail of any step, read that step's sub-skill (named in the parenthetical). If a step's behavior needs to change, change it in the owning skill, not here.

Every generation step (brainstorming/spec/plan/execute/product/design/backend/frontend/test/dockerize/auth/run-guide/docs) writes to the **TARGET project**, never to this agent repo. This document is instructions for the orchestrating agent; the artifacts land in the user's project.

## Resumability

The chain is long, so it is built to survive interruption.

- If a session is interrupted mid-chain, resume with `sdcorejs-explore (recovery mode)` plus the target project's `.sdcorejs/` docs, `product/` docs, and `design/` handoff (the persisted persona, specs, plans, session summaries, PRDs, user stories, UAT checklists, design specs/wireframes, user guide, and task tracker) - together they reconstruct where the build stopped and what's left.
- The **two approval gates** (GATE 1 spec, GATE 2 plan) are natural pause points - a build commonly stops there waiting on the user and resumes cleanly once they answer.
- If interruption happens after packaging but before stack verification, treat the package as unverified until the stack smoke in Step 10 runs in the resumed session.

## Tech users

A developer may invoke this skill, and it will work. But the granular skills give finer control - picking the stack, shaping the spec, reviewing each plan task, choosing comment levels. A developer who wants that control should drive the per-track skills directly (`sdcorejs-brainstorming` -> `sdcorejs-spec` -> `sdcorejs-plan` -> `sdcorejs-execute-plan` -> `sdcorejs-nestjs` / `sdcorejs-angular` -> `sdcorejs-dockerize` -> ...). This one-door experience is optimized for the **non-technical owner** who wants a running app without touching any of those levers.

<!-- response-style: auto-injected by sync-skills; do not edit mirror by hand -->

**Response style (terse mode active for this skill - reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal - no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
