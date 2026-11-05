# Orchestrator Workflow

Load only at the entrypoint trigger below. Preserve the shared session authority policy.

### Step 0 — Read-oriented project context

Before dispatching any reference, assemble read-only `project_context`. Use
valid summary sections when available. If summary is missing, legacy, unknown,
or stale, continue with targeted reads; use a scoped code map only when
cross-module relationships remain unresolved. Never refresh merely because the
summary is absent. A brand-new approved `init-portal` may create summary v2
after the scaffold exists; an architecture-level refresh belongs only to the
sequential workflow or integration owner.

Read `_refs/shared/frontend-architecture.md` before formulating or presenting any
architecture decision for a non-trivial routed screen, form, table, child
collection, drawer, workflow panel, or frontend service.
Verify that the approved plan dispatched by `sdcorejs-execute-plan` contains the completed
`frontend_architecture` contract. This executor must not create or self-approve a
missing contract; stop and return through `sdcorejs-execute-plan` when the gate is
missing, incomplete, or contradicted by current codebase evidence.

For any UI-affecting request, and always when the input includes a screenshot,
wireframe, mockup, Figma export, PRD, requirement document, user story, feature
description, acceptance criteria, mock API, OpenAPI/Swagger file, Postman
collection, MSW handler, endpoint table, JSON fixture, schema, or sample cURL,
read `_refs/angular/write-code/input-analysis.md` before choosing components,
services, or templates. For eligible Core UI projects this preflight owns Core
UI docs registry resolution; for plain Angular projects the work should already
have been routed away from this skill. It also owns project-local reuse
scanning, image decomposition, PRD requirement mapping, mixed image+PRD mapping,
API/service assumptions, and the mandatory post-implementation UI check. Present
the required reuse analysis/mapping before implementation.

If the approved execution profile is `technical-prototype`, also read
`_refs/angular/write-code/po-ba-prototype.md` immediately after
`input-analysis.md`. Validate the profile, semantic owner, optional-feature
approvals, and prototype assumptions with
`_refs/angular/execution-contract.mjs`. Generate only the approved fields,
screens, routes, validators, actions, and demo data. Enforce the template-first
invariant from that reference before code generation.

If a mock API, OpenAPI/Swagger file, Postman collection, MSW handler, mock
endpoint list, JSON fixture, API schema, or sample cURL drives the UI, also read
`_refs/angular/write-code/mock-api-input.md` before building `EntitySchema` or
writing models/services. The PRD/acceptance criteria are the behavior source of
truth; the API artifact is the data/endpoint contract. A mock API document alone
does not authorize live API integration.

Before generating or extending any model, interface, type, service, store, repository, or API client, also run the entity reuse preflight in `_refs/angular/write-code/reuse-existing-entities.md`. This is mandatory for API docs, mock API contracts, PRDs, Figma/image/screenshot input, business descriptions, schemas, and any feature with related entities. The codebase is the source of truth for reuse decisions; the external artifact is only the new contract.

Before writing any helper, formatter, validator, mapper, pipe utility, paging/filter helper, random-id helper, query-param helper, upload/download helper, or clipboard/browser helper, read `_refs/shared/sdcorejs-utils.md` and reuse `@sdcorejs/utils` when it covers the behavior. The package must be a direct target-project dependency before generated code imports it; do not rely on Core UI's transitive dependencies.

### Execution order + hand-off

Execution order: application baseline → module → entity → screens → actions,
with any explicitly approved optional pack inserted at the plan-defined
dependency point. `portal` means the `init-portal` Core UI starter template
baseline, not a custom shell. Admin/auth/account/role/permission is never added
unless the approved requirement/profile names it. If the plan touches multiple
items, preserve its dependency order and do not parallelize shared-state steps.
After all referenced steps finish, hand off as follows:

Technical prototype flow: input-analysis -> explicit profile validation ->
prototype assumptions -> init-portal if approved/needed -> approved module/entity
screens/actions -> finish gate.

#### MANDATORY: Core UI usage summary (show the user right after generating)

Right after the code is written and BEFORE the finish gate, emit a short table of every `@sdcorejs/angular` Core UI piece the feature actually uses — component, service, or directive — each with a one-line purpose **tied to this feature**, in the user's language. This gives the team a concise overview of the building blocks. Build the rows from what you ACTUALLY imported/used — never list a component you didn't use, never describe it generically.

```text
Core UI used in <feature name>:

| Core UI | Role in this feature |
|---|---|
| `SdTable` | Shows the <entity> list with pagination, filtering, and sorting |
| `SdNotifyService` | Shows success/error feedback when saving or deleting |
| `SdSection` | Groups fields on the detail screen |
| `sd-button` | Renders save, cancel, and action buttons |
```

Keep each purpose one line, concrete to the feature (not "a table component"). Use plain wording when the communication persona requests it. The same table is persisted into the module's user guide at the write-user-guide step.

This summary is Core UI only. If the target project is classified as
`plain-angular`, this skill must not run and no Core UI usage summary is
emitted.

For UI-affecting work, the final response must also include the concise
sections named `Core reuse summary` and `UI check`, as defined in
`_refs/angular/write-code/input-analysis.md`.

#### MANDATORY FINISH GATE (always — standalone trigger OR full SDLC flow)

Apply `_refs/shared/finish-gate.md` after every code-generation run, including
standalone requests. First resolve existing session authority and saved choices;
ask only for an unresolved optional action. Mandatory assessment does not imply
a new questionnaire. Bounded low-risk work uses its concise verification/review
baseline; non-trivial work preserves the applicable artifact/evidence gates.

Verification follows the agreed TDD or post-hoc strategy and affected risk.
Required tests and failed checks cannot be waived by finish choices. Additional
integration/E2E, new documentation and optional simplification remain scoped.

Then run the tail in this order, honoring only those finish-gate choices:

Documentation supplement: immediately after the Finish Gate test decision, run
`sdcorejs-documentation (documentation-gate mode)` and read
`_refs/documentation/gate.md`. This gate asks or loads saved project
preferences from `<target>/.sdcorejs/documentation/preferences.md` for
`user-guide` and `technical-doc` only. Ask before creating missing docs only when existing scoped session authority
does not cover that creation.
`code-documentation` is automatic for touched source files and is not controlled
by this approval gate.

1. `sdcorejs-test` - run the smallest meaningful checks for affected behavior using the agreed TDD/post-hoc strategy; report pass/fail and failing names. Additional integration/E2E follows scoped choices; unavailable infrastructure is `NOT RUN`, never pass. Close required verification gaps before a completion claim.
2. *(if Review not skipped)* `sdcorejs-review` (skills/shared/workflow/review.md; auto-detects Angular and loads `_refs/angular/review-code.md`) - convention check; actionable Angular code-review table with severity, group, file/line, risk, fix, and gate
3. *(if repair is authorized)* `sdcorejs-repair-loop` - apply findings, iterate until `BLOCKER`/`REQUIRED` findings are fixed or explicitly deferred
4. `sdcorejs-documentation (code-documentation mode)` - automatically apply concise source-code documentation rules to touched source files. Do NOT ASK for approval. Cross-track baseline + per-track addenda live in `_refs/documentation/code-documentation.md`
5. *(if UI-affecting)* Angular UI check from `_refs/angular/write-code/input-analysis.md` - run browser/preview verification when available; otherwise perform and report a code-level UI review. Fix obvious UI issues before continuing. If this changes code, rerun the smallest relevant check.
6. `sdcorejs-product` *(when user-visible feature traceability is needed)* - seed/update `.sdcorejs/docs/product/` with requirement, implementation, and test mapping
7. *(if Technical doc approved)* `sdcorejs-documentation (write-technical-doc mode)` - create/update the approved technical doc from source evidence.
8. `_refs/orchestration/tail/auto-docs.md` *(always)* - change-scoped execution record written to `<target>/.sdcorejs/docs/angular/`
9. *(if User guide approved)* `sdcorejs-documentation (write-user-guide mode)` - create/update the touched module's `.sdcorejs/documentation/user-guides/<module>/<module>.md` only when approved by the documentation gate or explicitly requested. Per-module incremental; after all module updates, the aggregate rebuilds exactly once when a guide changed, when explicitly requested, or when stale inside approved scope.
10. `_refs/orchestration/tail/auto-task-tracker.md` *(only when the sequential workflow or integration owner is authorized to update the shared backlog)* - reconcile durable follow-up work; never mirror live progress
11. `sdcorejs-explore (memories-readonly)` - only if durable knowledge surfaced; persistence requires action-specific write authority
12. `sdcorejs-ship (verify-before-done mode)` *(always)* - BLOCK "done" until acceptance criteria from the selected scope are verified or explicitly deferred
13. `sdcorejs-ship (branch-ready mode)` *(always)* - final read-only branch-ready gate over the final diff before any Git artifact handoff. No writes after branch-ready unless branch-ready is run again.

The finish assessment is mandatory. `Run review only` never authorizes repair.
`Defer` stops the remaining tail, including durable writes and Ship, with a
concise status and no completion claim. Otherwise run only applicable,
authorized steps; preserve acceptance verification and final read-only
branch-ready before any authorized Git artifact. Memory persistence requires
its separate action authority; backlog reconciliation requires owner authority.
