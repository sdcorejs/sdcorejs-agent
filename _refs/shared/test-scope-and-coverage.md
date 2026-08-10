# Test Scope and Coverage

## Contents

- [Scope inputs](#scope-inputs)
- [Risk matrix](#risk-matrix)
- [Coverage matrix](#coverage-matrix)
- [Status rules](#status-rules)
- [Parallel ownership](#parallel-ownership)

## Scope inputs

Build scope from current requirements, acceptance criteria, changed behavior,
repository conventions, and current evidence. A framework pattern is never a
requirement by itself. Record:

- target paths and owning project;
- user-visible behavior, API contracts, authorization boundaries, and data
  lifecycle affected by the change;
- required levels (`unit`, `component`, `integration`, `api-e2e`,
  `browser-e2e`, `uat`, or `ui-evidence-capture`);
- explicit exclusions and deferred risks;
- the current `associated_HEAD_or_diff`.

Missing or stale project summary is not a blocker. Use current files, the diff,
requirements, and targeted discovery.

Read `_refs/shared/decision-coverage.md`. Treat the approved
`decision_coverage` and `goal_backward_review` as authoritative coverage input:
preserve exact `R-###`, `AC-###`, `D-###`, `INV-###`, `TASK-###`, and
`EVIDENCE-###` identities, and surface any missing task, evidence, or invariant
mapping as a coverage gap. Test planning and execution may attach current run
evidence, but they do not renumber or silently replace approved identities.
For plan-backed work, also read `_refs/shared/validation-map.md`; it turns the
risk choices below into the single approved row-level validation authority.

## Risk matrix

Choose tests from observable risk rather than a fixed stack checklist.

| Risk | Prefer | Add when applicable |
|---|---|---|
| Pure transformation or branch logic | unit | property/boundary cases |
| Rendering and interaction | component | accessibility and keyboard cases |
| Adapter, database, queue, or external boundary | integration | failure, retry, and idempotency |
| HTTP contract or authorization | API e2e | server-side denial and tenant isolation |
| Critical user journey | browser e2e | real UI auth and cross-page state |
| Requirement sign-off | UAT | evidence link or explicit manual result |
| Guide screenshot | `ui-evidence-capture` | provenance, PII screening, artifact closure |

Test authorization at the server/API boundary when it exists. A hidden or
disabled control is useful UI behavior evidence, but is not proof that an
unauthorized request is denied.

## Coverage matrix

For plan-backed work, create `coverage_matrix` only by exact runtime projection
of `plan_context.validation_map`:

```yaml
validation_map: <exact approved plan_context.validation_map>
coverage_matrix: <projectCoverageMatrix(validation_map) without edits>
```

Use `_refs/shared/validation-map.mjs`; do not merge, drop, infer, or rewrite rows
at test time. Every in-scope AC or material risk needs a status.
`not-applicable` and `deferred` require a rationale. Do not invent a numeric
coverage threshold. If the project already enforces one, preserve it and report
the discovered source.

Coverage reports are fresh only when tied to the current
`associated_HEAD_or_diff`, command, workspace, and runner configuration.

## Status rules

- A planned case is not authored.
- An authored test is not executable proof.
- Written does not mean executed.
- Executed does not mean passed.
- A passing command does not cover requirements absent from the matrix.
- A stale report is historical context, never current verification.
- A blocked test records the blocker and skipped commands; it is not a failure.

## Parallel ownership

Partition by module or non-overlapping test path. Assign exactly one coordinator
as writer for shared runner configuration, persona catalogs, environment
manifests, global setup, snapshots, and aggregate reports. Workers must not edit
shared configuration or shared `.sdcorejs` summary/persona/memory/backlog
artifacts. Assign one auth setup writer per persona/environment state.
The coordinator merges case IDs, coverage rows, run IDs, artifact contexts, and
shared configuration after deterministic fan-in without dropping prior
evidence. Global verification and any Git handoff happen only after fan-in.
