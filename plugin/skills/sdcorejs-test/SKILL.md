---
name: sdcorejs-test
description: Test-track executor for unit/integration/e2e/UAT and RED-first TDD across Angular, NestJS, and Next.js. Use for test plans, writing/running tests, test-only approved plans, TDD gates, inspector JSON/POM e2e generation, or automatic executor tails. Detects stack, level, and test vs tdd mode; loads testing refs. Applies to test, angular, nestjs, nextjs. Runtime-localized.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Test Track


## Shared Protocols

Before executing this skill:
1. Read and apply `_refs/shared/tasklist.md` for non-trivial execution tasks.
2. Read and apply `_refs/shared/persona.md` if a project persona exists.
3. Read and apply `_refs/shared/project-context.md` for project memory, resume checkpoints, summaries, specs/plans, tasks, and relevant memories.
4. Current user request, current files, diffs, logs, failing tests, and command output override stored context.

## Purpose
Write and run unit, integration, e2e, and UAT-oriented tests across Angular, NestJS, and Next.js. This track skill is also the executor for approved test-only plans from `sdcorejs-execute-plan`.

It also owns `tdd mode`, the RED-first gate used by write-code orchestrators before production code for chunks where TDD is selected by `sdcorejs-brainstorming` and captured in `sdcorejs-plan`.

## Solution-root layout

When the target project has the solution-builder layout:

```text
<solution-root>/
  product/
    user-stories/
    acceptance-criteria/
    uat-checklists/
  design/
    specs/
    wireframes/
    exports/png/
  backend/
  frontend/
  test/
    e2e/
    fixtures/
    reports/
    test-cases/
```

Use these paths:

| Test kind | Location |
|---|---|
| Backend unit/integration | `backend/` following NestJS project conventions |
| Frontend unit/component | `frontend/` following Angular project conventions |
| Cross-stack e2e | `test/e2e/` |
| UAT test case docs | `test/test-cases/` |
| Shared fixtures | `test/fixtures/` |
| Runner reports / evidence | `test/reports/` |

Read `product/user-stories/`, `product/acceptance-criteria/`, and matching `design/specs/` before writing e2e/UAT tests. Each user story should map to at least one automated e2e, UAT checklist item, or explicitly deferred manual check.

## When to use
- Right after a code executor finishes, when the finish gate keeps tests enabled.
- A direct user request asks to write or run tests.
- A direct user request asks to use TDD, write tests first, or run a red-green-refactor loop.
- The user asks what should be tested.
- `sdcorejs-execute-plan` detects a test-only approved plan.
- A track write-code orchestrator reaches a TDD gate before writing production code.
- The user pastes an `sd-autoid-inspector` JSON/POM export.

## Step 0 - Context preflight

Before detecting mode/stack/level or writing tests, run `sdcorejs-explore
(summary mode)` through `_refs/shared/project-context.md`.

- For an existing target project, ensure `<target>/.sdcorejs/summary.md` exists
  or is refreshed so tests use the real stack, runner, routes, modules, fixtures,
  page objects, auth shape, and product/design artifacts.
- For a test-only plan in a not-yet-scaffolded solution root, read the approved
  spec/plan plus `product/` and `design/` artifacts, then mark runner commands
  as pending until the relevant backend/frontend scaffold exists.
- In `tdd` mode called by a write-code orchestrator, use the caller's already
  loaded summary when it is current; refresh only when paths or stack signals
  have drifted.

## Step 1 - Detect mode, target stack, and level

Mode signals:

| Mode | Use when |
|---|---|
| test | default; write/run unit, integration, e2e, or UAT tests |
| tdd | "use TDD", "write tests first", "test first", "red-green-refactor", or a write-code orchestrator TDD gate |

Stack signals:

- angular: `angular.json`, `@angular/core`, `@sdcorejs/angular`
- nestjs: `nest-cli.json`, `@nestjs/core`
- nextjs: `next.config.*`, `next`

Level signals:

| Level | Use when |
|---|---|
| unit | pure logic, validators, mappers, pipes, guards, component methods |
| integration | DI/router/DB/API boundary with mocked external services |
| e2e | full user/browser/API flow, Playwright/Cypress/Robot/supertest |
| UAT | PO/QC-readable scenario checks from `product/uat-checklists/` |

State the detected mode, stack, and level in the report header.

## Step 2 - Load knowledge
Always read `_refs/shared/testing-philosophy.md`.

Then read the matching stack+level ref:

- angular -> `_refs/angular/test-{unit,integration,e2e}.md`
- nestjs -> `_refs/nestjs/test-{unit,integration,e2e}.md`
- nextjs -> `_refs/nextjs/build-website/test-e2e.md` for e2e; for unit/integration use project conventions plus the shared philosophy.

For Robot Framework, also read `_refs/angular/e2e-robot-conventions.md`.

For `tdd` mode, also read `_refs/shared/tdd.md` and follow its RED-GREEN-REFACTOR loop exactly. The Iron Law from that reference is absolute: no production code for the selected chunk before a failing test has been written and verified RED for the right reason.

## Step 3 - Write, run, report

1. Read the feature/files under test.
2. If product docs exist, read the relevant PRD, user stories, acceptance criteria, and UAT checklist.
3. Reuse existing fixtures, page objects, mocks, and runner conventions.
4. Write tests that verify behavior, not implementation details.
5. For solution-builder roots, store cross-stack e2e/UAT assets under `test/` and link them back to user story / AC IDs.
6. Run the tests in the current turn.
7. Report command, exit code, pass/fail counts, failing spec names, and the first useful error line.

If failures reveal a real product bug, route to `sdcorejs-debug`. Do not skip or weaken tests to get green output.

## Direct invocation tail

Use this section only when `sdcorejs-test` was invoked directly or as the executor
for a test-only approved plan. When a code-generation orchestrator called this
skill from its finish gate, return the test report to that orchestrator; the
caller owns the rest of the tail chain.

After direct test work:

1. If this skill wrote or edited test files, fixtures, page objects, UAT cases, or
   reports, run the verification commands from Step 3 and capture the real output.
2. Run `sdcorejs-ship (verify-before-done mode)` when a spec, product ledger, or
   approved test plan contains acceptance criteria. If no criteria exist, report
   that acceptance verification was skipped and list the test commands that did
   run.
3. Run `_refs/orchestration/tail/auto-docs.md` with `TRACK=test` so the session
   summary lands in `<target>/.sdcorejs/docs/test/`.
4. Run `_refs/orchestration/tail/auto-task-tracker.md` immediately after
   auto-docs to tick completed test tasks and add follow-ups from the test report.
5. Run `sdcorejs-explore (memories mode)` only when durable testing knowledge
   surfaced, such as a recurring fixture convention, runner limitation, or
   stakeholder testing preference.

If this skill only answered a read-only testing question and wrote no artifacts,
skip auto-docs and task tracker; update the visible task/checkpoint state only.

## TDD mode

Use this mode inside write-code tasks and when the user asks for test-first work.

For each selected chunk (service, component, function, handler, validator, guard, transaction, or workflow):

1. Read `_refs/shared/tdd.md`.
2. Write the smallest failing test that names the behavior.
3. Run the focused test and verify RED for the right reason.
4. Write the minimum production code to pass.
5. Run the focused test and verify GREEN.
6. Refactor only after GREEN, then run the focused test again.
7. Repeat for the next behavior.

Skip TDD mode only for template-only changes, configuration, module declarations, and barrel exports. For any testable logic, skipping TDD requires an explicit plan/user override to post-hoc testing.

Report:

- test file written
- RED command and first useful failure
- production file touched
- GREEN command and result
- refactor command/result when refactor happened

## e2e modes

Mode A - known intent:

- Used after code generation or when the user names the flow.
- Write happy-path tests and important negative cases.
- Run the configured runner.

Mode B - inspector export / selector inventory:

- An inspector export is not a test intent.
- Do not generate tests straight from selectors.
- Run the gated flow first:
  `sdcorejs-brainstorming` -> `sdcorejs-spec` -> `sdcorejs-plan` -> `sdcorejs-execute-plan`.
- The plan must confirm cases, expected results, auth/env/data, selector reuse, page-object or keyword inventory, and verification commands.

## Rules

### Must do
- Use the framework already configured; do not introduce a second runner.
- Read the shared testing philosophy before writing tests.
- Run the tests and report real output.
- Reuse existing project test layout.
- Use `test/` for solution-builder cross-stack e2e/UAT assets.
- Link e2e/UAT tests to product user story and acceptance criterion IDs when product docs exist.
- Keep test data deterministic.
- In `tdd` mode, verify RED before writing production code and verify GREEN after implementation.
- For direct write/edit test work, run the Direct invocation tail so auto-docs and the living task tracker stay current.

### Must not
- Mark failing tests `.skip` / `xit` to force green CI.
- Mock the code under test.
- Sleep in tests; use proper waits or fake timers.
- Generate e2e tests from an inspector export without the gated flow.
- Claim pass without a current runner output.
- Write solution-level e2e reports only inside backend or frontend when a root `test/` track exists.
- In `tdd` mode, write production code first and backfill tests later.

## Cross-references
- `sdcorejs-execute-plan` - routes approved test plans here
- `sdcorejs-brainstorming` - confirms test intent when cases are unclear
- `sdcorejs-product` - source of product user stories, acceptance criteria, and UAT checklist
- `sdcorejs-design` - source of screen flows and visual states for e2e/UAT coverage
- `_refs/orchestration/tail/auto-docs.md` - direct test session summaries under `.sdcorejs/docs/test/`
- `_refs/orchestration/tail/auto-task-tracker.md` - living test TODO updates after auto-docs
- `_refs/shared/tdd.md` - failing-test-first discipline inside write-code tasks
- `_refs/shared/testing-philosophy.md`
- `_refs/<track>/test-<level>.md`

<!-- response-style: auto-injected by sync-skills; do not edit mirror by hand -->

**Response style (terse mode active for this skill - reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal - no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
