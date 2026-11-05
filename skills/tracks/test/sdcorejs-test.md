---
name: sdcorejs-test
description: Requirement-driven test executor for planning, authoring, running, TDD, UAT, test coverage analysis, authenticated browser testing, and verified UI evidence across existing project stacks. Use for direct test work; route product requirement/traceability coverage without test work to sdcorejs-product, debugging fixes to sdcorejs-debug, and guide or screenshot documentation to sdcorejs-documentation. Runtime-localized.
required-actions: artifact.read, artifact.write, context.pass, verification.run, progress.create, progress.update, user.choose, user.approve
---

# Test Track

## Purpose and ownership

Own test planning, test authoring, safe execution, coverage matrices, UAT cases,
RED-first TDD, authenticated runner evidence, and UI capture verification.
`sdcorejs-debug` owns root-cause investigation and production bug fixes.
`sdcorejs-documentation` owns guide prose and image placement. This skill must
not invoke Git, call `sdcorejs-git`, install dependencies, or start/modify a
runtime unless the current request explicitly authorizes that exact action.

## Shared protocols

1. Read `_refs/shared/runtime-protocols.md`, then
   `_refs/shared/tasklist.md` for non-trivial work and
   `_refs/shared/persona.md` when present.
2. Apply Project Context Preflight v2 from `_refs/shared/project-context.md`.
   Current request, files, diff, requirements, command output, and test failures
   override stored context. Missing or stale summary never blocks testing and
   does not authorize a refresh. Continue with targeted reads or a scoped code
   map.
3. Apply `_refs/shared/artifact-lifecycle.md` whenever evidence or documentation
   assets are created; return `artifact_context`.
4. Apply `_refs/shared/user-choice-prompt.md` before presenting approval or
   mode choices.
5. Localize runtime-facing prose to the user's language. Keep schema keys,
   commands, identifiers, and canonical source English.

## Step 1 - Classify the action

Pick exactly one public action:

| `test_action` | Boundary |
|---|---|
| `run-only` | Discover and run existing commands; no edits. |
| `write-tests` | Edit scoped tests/fixtures; discovery only, no run. |
| `write-and-run` | Edit scoped tests, then run focused discovered commands. |
| `test-plan-readonly` | Read-only risk, case, and command plan. |
| `coverage-audit` | Read-only current coverage and requirement gaps unless tests are requested. |
| `uat-cases` | Produce requested UAT cases/checklists; no source implementation. |
| `tdd-red` | Write the smallest failing test and prove RED; no production code. |
| `tdd-cycle` | RED, minimal GREEN implementation, then refactor and verify. |
| `failing-output-triage` | Explain/classify sanitized output without edits. |
| `debug-handoff` | Stop and transfer fix/root-cause work to `sdcorejs-debug`. |

`ui-evidence-capture` is a direct/internal evidence action for documentation,
ship, or an explicit capture request. It is not a general routing target.

Requests to debug, fix, repair, investigate, or root-cause a failing test select
`debug-handoff`. Pass the smallest reproduction plus current `test_context`,
`test_status`, and `test_evidence`.

## Step 2 - Classify the stack profile

Use files, dependencies, workspace structure, existing tests, runner config, and
approved requirements. Do not infer conventions from framework name alone.

| `stack_profile` | Signals and ref policy |
|---|---|
| `core-ui-angular` | Angular with `@sdcorejs/angular`; load applicable Angular refs. |
| `legacy-core-ui-angular` | Angular with existing `@sd-angular/core`; load applicable Angular refs. |
| `plain-angular` | Angular without those packages; shared/generic refs only. |
| `sdcorejs-nestjs` | NestJS with detected SDCoreJS backend conventions; applicable NestJS refs. |
| `plain-nestjs` | NestJS without those conventions; shared/generic refs only. |
| `nextjs-build-website` | Detected/approved build-website profile; applicable Next.js ref. |
| `plain-nextjs` | Next.js without build-website conventions; shared/generic refs only. |
| `react-vite` | React with Vite; preserve existing runner. |
| `react-cra` | Create React App; preserve existing runner. |
| `react-next-generic` | React component work inside plain Next.js. |
| `general` | Any other stack, including Python, Java, .NET, Go, and Rust. |

Repository kind is independently `single-app`, `monorepo`, `multi-project`,
`test-only`, or `unknown`. In a monorepo or multi-project layout, identify the
owning project and command cwd. Component tests stay with their project;
shared cross-stack e2e lives under an existing shared test project when one is
present.

## Step 3 - Load only relevant contracts

Always load:

- `_refs/shared/testing-philosophy.md`
- `_refs/shared/test-command-discovery.md`
- `_refs/shared/test-environment-guard.md`
- `_refs/shared/test-context.md`
- `_refs/shared/test-scope-and-coverage.md`
Conditional contracts:

- `_refs/shared/validation-map.md` for governed acceptance/coverage mapping.
- `_refs/shared/convergence-contract.md` when producing governed convergence
  evidence; execute `_refs/shared/convergence-contract.mjs` validators at that
  gate. Read implementation details only to diagnose a validator issue.
- `_refs/shared/test-auth-personas.md` for authenticated/protected behavior.
- `_refs/shared/test-data-lifecycle.md` when tests create or mutate fixtures,
  accounts or persistent state.

A single existing unit-test run needs no auth/data/convergence body when those
concerns are absent. Preserve current command, owner, scope and result identity.

Load `_refs/shared/test-generic.md` for plain/general profiles. Load only the
selected level from `_refs/angular/test-{unit,integration,e2e}.md`,
`_refs/nestjs/test-{unit,integration,e2e}.md`, or
`_refs/nextjs/build-website/test-e2e.md` when its profile applies. Load
`_refs/angular/e2e-robot-conventions.md` only for detected Robot projects.
Load `_refs/shared/test-playwright.md` only for detected/approved Playwright.
TDD actions also load `_refs/shared/tdd.md`.

When topology contains modules, nested repositories, or submodules, also load
`_refs/shared/module-e2e-contract.md` and execute its
`module-e2e-contract.mjs` validators. Behavior ownership controls authoring:
module behavior keeps tests, fixtures, page objects, selectors, personas, and
data contracts in the module repository; portal-shell behavior stays in the
portal; cross-module behavior requires an explicit integration owner. Portal
may discover/run/aggregate but never copy a module suite or fall back to portal
when the module is missing or non-writable.

`ui-evidence-capture` additionally loads
`_refs/shared/test-ui-evidence.md`. It must reuse the existing runner and return
verified provenance; otherwise classify the capture as diagnostic/local-only.

## Step 4 - Build v2 preflight

Before edits or commands, emit the schema from `_refs/shared/test-context.md`:

- `test_context.schema_version: 2`, current `associated_HEAD_or_diff`,
  classification, scope/owner, runner/config/cwd, environment/write policy,
  applicable auth/personas and data ownership/cleanup, execution plan; when
  governed, the exact approved validation map and its `projectCoverageMatrix`
  runtime projection. Ungoverned unit runs leave plan/map references absent or
  empty as allowed by the consumer; never fabricate an approved map;
- independent `test_status` fields for planning, authoring, executability,
  execution, result, evidence, and documentation;
- `test_evidence.schema_version: 2` with append-oriented runs, cases, captures,
  skipped commands, and `redactions_applied: true`.
- Stable owner repository/module plus execution-host identity, source
  fingerprint/revision map, evidence class, artifact hashes, actual command,
  and portal/module/pinned revisions when module E2E is in scope.

Validate credential key references without reading or printing secret values.
Unknown/prod environments and unsafe writes fail closed per environment/data
contracts. Planning never masquerades as execution.
Preserve `PASSED`, `FAILED`, `SKIPPED`, `NOT RUN`, and `NOT APPLICABLE` as
distinct module results. Only current `full-e2e` evidence can satisfy a required
module release check.

## Step 5 - Discover and execute

1. Discover the existing runner and command from manifests, configs, CI, docs,
   and nearby tests. The existing project command is the source of truth.
2. Resolve the correct workspace/cwd. Never invent a command, package manager,
   threshold, service, seed, browser install, auth bypass, or database reset.
3. Map requirements and risks before authoring. Prefer the smallest level that
   proves behavior; use server/API denial for authorization boundaries. For an
   approved plan, preserve `plan_context.validation_map` exactly.
4. For state changes, prove run ownership and idempotent cleanup first. Block
   unsafe staging/production effects and real email, SMS, or payments.
5. Run the narrowest relevant command before broader verification. Preserve
   exact exit code and a redacted summary; append current runs/cases and record
   skipped commands explicitly. For an approved/governed validation map, call
   `evaluateValidationEvidence` and emit exact current `convergence_evidence_refs`
   from approved row evidence IDs. An ungoverned unit run reports its observed
   result without mapped acceptance/convergence claims.
6. On a source failure, do not silently fix production code outside `tdd-cycle`;
   route to `sdcorejs-debug`.

## TDD ledger

For each behavior record case ID, requirement/risk, RED command and failure
reason, GREEN command and result, refactor result, and associated diff. RED must
fail for the intended missing behavior. A compile/config/environment failure is
blocked, not a valid RED.

## Conditional downstream context

For AI-agent tests, simplification verification or parallel/delegated results,
load `_refs/shared/test-downstream-context.md` and only the matching section.
Preserve current test evidence identities, independent test status and owner
handoff; workers never claim integration verification from unit results.

## Direct invocation tail

After scoped work:

1. Run focused verification allowed by the action and finalize v2
   `test_context`, `test_status`, and multi-run `test_evidence`.
2. Emit `ui_capture_context` only when the internal capture action actually ran.
3. Apply `_refs/documentation/gate.md` only when documentation was explicitly
   requested or the test change introduced a reusable harness, user-visible
   flow evidence, or documentation-relevant behavior. Internal unit tests alone
   do not require a user guide.
4. If approved, delegate technical/user-guide prose to
   `sdcorejs-documentation`; a real screenshot request returns through
   `ui-evidence-capture`.
5. Create a change-scoped execution record only for durable decisions/evidence,
   never merely because a thread ended. Update a shared test backlog or memory
   only when the sequential/integration owner has durable knowledge to retain.
6. When approved AC/plan/ledger is in scope, hand current evidence to
   `sdcorejs-ship (verify-before-done)` and then the final read-only
   `branch-ready` gate. Any later write makes that gate stale.

Read-only actions stop after their report/runtime context and must not dirty
`.sdcorejs`. This tail still never invokes Git.

## Prove the affected risk

When testing review or a small fix, map the actual failure trigger to the smallest
layer that observes its consequence. Reuse the approved validation-map and test
context; do not introduce a parallel coverage enum. For complete-data claims,
derive the effective cap N and assert exact results/final IDs at N-1, N and N+1,
including configured caps, server clamps and later-page errors.
For protection, call the real enforcement boundary with unauthenticated, wrong
permission, wrong owner and cross-tenant identities. UI visibility is not denial.
A targeted mutation removing continuation or enforcement must fail the relevant
assertion, not an import/build/setup step. Preserve negative controls, current
revision/diff, exact command and test case IDs. Do not require new tests for a
formatting-only change with no behavior risk.
