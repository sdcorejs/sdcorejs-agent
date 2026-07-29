# Worked Example

This example shows the intended full workflow without depending on a live agent
transcript. It is a documentation example, not proof that a specific tool
followed the flow.

## Request

```text
Add a Product management feature to an Angular portal and NestJS backend.
Products need code, name, status, price, and stock quantity. Users can list,
create, edit, view details, and export products.
```

## 1. Brainstorming

The agent first confirms blockers instead of writing files immediately:

- Target solution root and tracks: Angular and NestJS.
- Product fields and validation rules.
- Screens and workflows: list, create/update drawer or page, detail view, export.
- Permission model and any existing module conventions.
- Verification commands available in the target repo.

Expected output is a short scope confirmation plus any missing questions.

## 2. Spec

After the user confirms requirements, `sdcorejs-spec` writes a draft spec under
the target project's `.sdcorejs/docs/<track>/` area. The spec captures:

- Supported tracks and target folders.
- User-visible behavior.
- Data contracts and validation.
- Permission and audit expectations.
- Test and acceptance criteria.
- Out-of-scope items.

The user must explicitly approve the spec before planning starts.

## 3. Plan

After spec approval, `sdcorejs-plan` writes a numbered implementation plan. A
good plan decomposes work into outcomes such as:

1. Add backend Product entity, schema, service, controller, and tests.
2. Add Angular Product models, service, routes, list screen, and detail flow.
3. Add export action and permission checks.
4. Run unit/integration/e2e checks.
5. Run finish gates: tests, documentation choice, optional behavior-preserving
   simplification, affected focused tests, review/repair loop, docs,
   verify-before-done, and branch-ready.

The user must explicitly approve the plan before execution.

## 4. Execute Plan

`sdcorejs-execute-plan` owns execution routing. Before any implementation, it
checks the executable units, ownership, and runtime capabilities. This example
may offer sequential versus parallel because backend and frontend can be real,
independent choices; one unit or an unsafe/unavailable split auto-selects
sequential without a fake prompt. Parallel work only proceeds through
`sdcorejs-parallel-dispatch`, which decides whether the file scopes are safe to
split.

Expected execution routing:

- Backend work -> `sdcorejs-nestjs`.
- Frontend work -> `sdcorejs-angular`.
- Test-only evidence -> `sdcorejs-test`.
- Product traceability updates -> `sdcorejs-product`.

## 5. Communication Economy Policy

During execution, the authoritative runtime context retains the approved spec
and plan identities, current HEAD or diff fingerprint, acceptance criteria,
ownership, verification state, and artifact closure. The user projection does
not repeat the full spec, plan, diff, or command log. A routine progress event
can say that backend verification completed; the final response then reports
the overall outcome without repeating an identical progress summary.

When the host proves support for `runtime_context_channel`, `context.pass` can
deliver the typed context to the next consumer. An `unsupported` or `unknown`
host uses a portable handoff containing the required IDs, paths, hashes, state
delta, evidence references, blockers, and exact next action. Missing required
fields fail closed.

This successful execution uses the `compact` profile with complete professional
sentences. A normal review with findings uses `standard`. Spec/plan approval,
security or destructive decisions, ambiguity, failed verification, and blockers
automatically use `detailed`. The user may also request `compact`, `standard`,
`detailed`, or `full context`; explanation depth changes, but outcomes and
evidence do not.

## 6. Finish Gates

Every code-generation run ends with the finish tail:

- Run relevant tests and disclose skipped checks.
- Offer bounded behavior-preserving simplification; if selected, use the green
  test baseline and rerun affected focused tests before review.
- Run review and repair-loop if findings exist.
- Add or update code documentation for touched source.
- Ask the documentation gate for user/technical docs when needed.
- Run `sdcorejs-ship` verify-before-done and branch-ready modes.
- Close native progress only if its state changed; do not emit a duplicate
  user-visible summary immediately before the final response.
- Update durable task records and memories when useful. Runtime progress remains
  in the current thread or harness.

## 7. Evidence Summary

A good Communication Economy Policy final response reports evidence, not
confidence or repeated runtime state:

```text
Implemented Product management across backend and frontend.

Verification:
- npm run test:backend - pass
- npm run test:frontend - pass
- npm run e2e:product - pass
- npm run check:skills - pass

Skipped:
- Full target-app E2E was not run because the environment lacked Docker.
```

For a live release, pair this worked example with sanitized real-agent
transcripts using `docs/REAL_AGENT_VALIDATION.md`.
