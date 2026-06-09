---
name: sdcorejs-test
description: Single entry point for writing and running tests across every SDCoreJS track. Auto-detects the stack (Angular · NestJS · Next.js) AND the test level (unit · integration · e2e) from intent, loads the cross-track principles from `_refs/shared/testing-philosophy.md`, then the stack+level patterns from `_refs/<track>/test-<level>.md`, writes the tests, runs them, and reports pass/fail + failing names. Default right after a `<track>-write-code` orchestrator = happy-path e2e. Special e2e Mode B is a GATED workflow (brainstorm → clarify → plan → generate → verify) triggered when an `sd-autoid-inspector` JSON/POM export is pasted. Keeps `sdcorejs-tdd` (RED-first discipline) separate. Triggers - "write tests", "write/add tests", "unit test", "integration test", "e2e", "test a flow", "what should I test", "test pyramid", "Cypress/Playwright/Robot Framework", "e2e from autoid inspector", "JSON inspector", or automatic after a write-code orchestrator. Applies to angular, nestjs, nextjs. Runtime-localized.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Test (unified, track + level aware)

## Purpose
One skill for unit / integration / e2e across every stack. Detect the track and
the test level, load the principles + the stack-specific HOW, write the tests, run
them, report. Replaces the per-track `sdcorejs-testing-{e2e,integration,unit}-<track>`
skills and the `sdcorejs-testing-philosophy` skill (now a reference doc). The
RED-first discipline stays in its own skill — `sdcorejs-tdd`.

## When to use
- Right after a `<track>-write-code` orchestrator finishes → happy-path e2e (Mode A)
- User asks "write tests / add tests / unit test / integration test / e2e for ..."
- User asks "what should I test", "test pyramid", "mock vs real DB" → principles
- User pastes an `sd-autoid-inspector` JSON/POM export → **e2e Mode B (gated)**

## Step 0 — Detect track + level

**Track** (directory signals): `angular.json`/`@sdcorejs/angular` → angular ·
`nest-cli.json`/`@nestjs/*` → nestjs · `next.config.*`/`next` → nextjs · monorepo → scope per stack.

**Level** (from intent):
| Level | Use when |
|---|---|
| **unit** | pure logic / validators / mappers / pipes / guards; "unit test", "function/validator test" — many, fast, no I/O |
| **integration** | real DB / router / DI, mocked externals; "integration test", "test API + DB", "supertest", "pg-mem" |
| **e2e** | full user flow (browser / supertest); "e2e", "flow test", after write-code, or an inspector export |

State the detected track + level in the report header.

## Step 1 — Load the matching knowledge
- **Always** read `_refs/shared/testing-philosophy.md` (pyramid, mock-vs-real, AAA, naming, behaviour-not-implementation, what-NOT-to-test).
- Then the stack+level ref:
  - angular → `_refs/angular/test-{e2e,integration,unit}.md`
  - nestjs → `_refs/nestjs/test-{e2e,integration,unit}.md`
  - nextjs → `_refs/nextjs/build-website/test-e2e.md` (unit/integration for nextjs: apply philosophy + Jest defaults; no dedicated ref yet)

## Step 2 — Write → run → report
1. Read the feature/files under test. Match the project's existing test layout/fixtures — don't impose a new convention.
2. Write tests per the loaded ref (framework, fixtures, runner). Honour the philosophy (AAA, behaviour-not-implementation, no shared mutable state, no sleeps).
3. **Run them** and read the output — never claim pass without it.
4. Report: pass/fail counts + failing spec names + first error line. A real-bug failure → route to `sdcorejs-debug` (never `.skip` to green CI). Env failure (no dev server / browser) → surface the exact local command.

### e2e modes
- **Mode A (default, after code-gen):** intent is known from the session → detect framework (Cypress / Playwright / Robot Framework — Robot loads `_refs/angular/e2e-robot-conventions.md`), write happy-path specs, run, report.
- **Mode B (GATED — inspector export / "test the screen being built"):** an inspector export is a selector inventory, NOT intent. Do NOT generate straight from it. Run the gate first: `sdcorejs-brainstorm` (which flows/cases) → `sdcorejs-clarify-requirements` (framework, selectors+coverage, cases with expected results, auth/env, data, reuse) → `sdcorejs-write-plan`/`sdcorejs-review-plan` (case + keyword/page-object inventory, NEW vs REUSE) → generate → verify. Full procedure: `_refs/angular/test-e2e.md`.

## Rules

### MUST DO
- Detect track + level first; state them in the header.
- Read `_refs/shared/testing-philosophy.md` before writing — get the WHAT/WHY right, not just the HOW.
- Use ONLY the framework already configured; never introduce a second.
- RUN the tests and report real pass/fail + failing names + exit code.
- Match the project's existing fixtures/layout/keyword style; reuse before creating.

### MUST NOT
- Mark a failing test `.skip`/`xit` to make CI green — fix the SUT or route to `sdcorejs-debug`.
- Mock the code under test, or mock your own DB in an integration test (proves nothing).
- Sleep in tests (`setTimeout`) — use fake timers / proper waits.
- Generate e2e straight from an inspector JSON without the Mode-B gate (selector dump, no assertions).
- Claim ✅ without having executed the runner this turn.

## Anti-patterns
- Inverted pyramid (heavy e2e, no unit) — push logic down to unit-testable units.
- One e2e that tests 8 features — when it fails you can't tell what broke.
- Snapshot-everything — detects change, not correctness.
- Tests coupled to implementation (private methods, internal state) — test the contract.

## Cross-references
- Principles: `_refs/shared/testing-philosophy.md`
- Stack+level patterns: `_refs/<track>/test-<level>.md` (nextjs e2e: `_refs/nextjs/build-website/test-e2e.md`)
- RED-first discipline (write the failing test first): `sdcorejs-tdd`
- Robot Framework conventions: `_refs/angular/e2e-robot-conventions.md`
- Verification gate: `orchestration/verify-before-done` (ensures the right tests ran before "done")
