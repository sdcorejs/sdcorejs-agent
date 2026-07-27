---
name: sdcorejs-test
description: Requirement-driven test executor for planning, authoring, running, TDD, UAT, test coverage analysis, authenticated browser testing, and verified UI evidence across existing project stacks. Use for direct test work; route product requirement/traceability coverage without test work to sdcorejs-product, debugging fixes to sdcorejs-debug, and guide or screenshot documentation to sdcorejs-documentation. Runtime-localized.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
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

1. Read `_refs/shared/tasklist.md` for non-trivial work and
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
- `_refs/shared/test-auth-personas.md`
- `_refs/shared/test-data-lifecycle.md`

Load `_refs/shared/test-generic.md` for plain/general profiles. Load only the
selected level from `_refs/angular/test-{unit,integration,e2e}.md`,
`_refs/nestjs/test-{unit,integration,e2e}.md`, or
`_refs/nextjs/build-website/test-e2e.md` when its profile applies. Load
`_refs/angular/e2e-robot-conventions.md` only for detected Robot projects.
Load `_refs/shared/test-playwright.md` only for detected/approved Playwright.
TDD actions also load `_refs/shared/tdd.md`.

`ui-evidence-capture` additionally loads
`_refs/shared/test-ui-evidence.md`. It must reuse the existing runner and return
verified provenance; otherwise classify the capture as diagnostic/local-only.

## Step 4 - Build v2 preflight

Before edits or commands, emit the schema from `_refs/shared/test-context.md`:

- `test_context.schema_version: 2`, current `associated_HEAD_or_diff`,
  classification, scope/owner, runner/config/cwd, environment/write policy,
  auth/personas, data ownership/cleanup, execution plan, and coverage matrix;
- independent `test_status` fields for planning, authoring, executability,
  execution, result, evidence, and documentation;
- `test_evidence.schema_version: 2` with append-oriented runs, cases, captures,
  skipped commands, and `redactions_applied: true`.

Validate credential key references without reading or printing secret values.
Unknown/prod environments and unsafe writes fail closed per environment/data
contracts. Planning never masquerades as execution.

## Step 5 - Discover and execute

1. Discover the existing runner and command from manifests, configs, CI, docs,
   and nearby tests. The existing project command is the source of truth.
2. Resolve the correct workspace/cwd. Never invent a command, package manager,
   threshold, service, seed, browser install, auth bypass, or database reset.
3. Map requirements and risks before authoring. Prefer the smallest level that
   proves behavior; use server/API denial for authorization boundaries.
4. For state changes, prove run ownership and idempotent cleanup first. Block
   unsafe staging/production effects and real email, SMS, or payments.
5. Run the narrowest relevant command before broader verification. Preserve
   exact exit code and a redacted summary. Record skipped commands explicitly.
6. On a source failure, do not silently fix production code outside `tdd-cycle`;
   route to `sdcorejs-debug`.

## TDD ledger

For each behavior record case ID, requirement/risk, RED command and failure
reason, GREEN command and result, refactor result, and associated diff. RED must
fail for the intended missing behavior. A compile/config/environment failure is
blocked, not a valid RED.

## AI-agent context

When the subject carries `ai_agent_context`, verify its approved hashes,
resolved engine/capability profiles, contract paths, target paths, and
offline/live evidence boundary before authoring cases. Preserve the context in
`test_context`; do not reinterpret profile policy from implementation prose.

Test server-side denial independently from model behavior: untrusted/model
tenant selection, missing permissions, raw tools, stale/unbound approval,
self-approval, cross-tenant session reuse, provider storage without governance,
invented evidence, unsafe trace payloads, and exhausted limits must fail
deterministically. Run offline contract fixtures and deterministic gates
separately from any authorized live behavioral check. Never promote an offline
pass to live engine/model compatibility evidence, and never read ambient
credentials merely to discover whether a live check is possible.

## Simplification context

When `simplify_context` is present, consume its selected files/hunks, diff
scope hash, preserved surfaces, baseline commands, and pass ledger. Keep
pre-simplification and post-simplification command evidence as distinct
append-only runs. Rerun the affected focused commands after every successful
write pass and associate the result with the current diff.

Do not edit expectations, fixtures, snapshots, prompts, strings, or contracts
to legitimize a behavior change. Authored tests without a passing run are not a
green baseline. A simplification write makes prior affected test evidence
stale; only a current post-simplification run can restore it.

## Parallel and downstream handoff

Use one writer for shared runner config, persona catalogs, environment files,
global setup, snapshots, and aggregate reports. Module workers own only their
assigned test paths and must not edit shared config.

Return localized summary plus:

- `test_context`, `test_status`, and `test_evidence`;
- authored/changed files and coverage matrix gaps;
- exact commands run/skipped, exit codes, cleanup outcome, and blockers;
- `ui_capture_context` when applicable;
- complete `artifact_context` lifecycle identity plus `required_with_change`,
  `shared_owned`, `conditional`, `local_only`, and `unrelated_observed`.

Never claim tests passed from authored files, old reports, or legacy v1
evidence. Do not invoke Git; callers decide review, repair, documentation, ship,
and Git transitions.

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
