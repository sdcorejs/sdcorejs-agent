# Project Blueprint

Use this reference when initializing a project or recording an existing project
baseline. Explore owns the inventory. It connects project decisions to their
evidence; accepted conventions and approved architecture remain the rule
authority. Product owns requirements, Spec owns accepted behavior, Architecture
owns boundaries, Test owns test execution, and the canonical validation map owns
delivery evidence evaluation.

The deterministic, side-effect-free helper is
`_refs/shared/project-blueprint.mjs`. It neither scans a repository nor runs
commands, writes files, approves decisions, migrates code, or establishes
delivery readiness.

## Storage and ownership

Resolve the blueprint root from `systemRegistry.artifact_roots.blueprints` in
`_refs/shared/system-registry.json`. The canonical path is
`.sdcorejs/blueprints/<kebab-case-name>.json`, with
`artifact_kind: project-blueprint` and `owner: sdcorejs-explore`. A blueprint
belongs to the target repository, never the authoring pack by default.

The owning Explore `project-blueprint-write-approved` action performs
persistence only under scoped session or approved initialization authority.
Read-only exploration may return a runtime candidate. Parallel workers may
return findings but cannot persist the shared blueprint. An unavailable module
owner blocks its write; a portal is not a fallback owner. Carry lifecycle
metadata and `artifact_context` under `_refs/shared/artifact-lifecycle.md`.
This reference introduces no new approval ceremony and no automatic migration.

Keep a single inventory for a declared scope. Reference an accepted convention
by canonical path, `rule_id` and source-byte hash. Reference approved architecture
by its canonical path and hash. Do not copy their editable rules into a second
catalog. A blueprint may explain how a decision applies without redefining its
authority. Follow `_refs/shared/convention-context.md` for precedence, accepted
versus observed status, compatibility exceptions, and owner resolution.

## Initialization procedure

1. Resolve the target repository, effective instructions, ownership and approved
   scope through `_refs/shared/project-context.md`. Inspect current files and
   relevant accepted decisions. Do not infer a stack from a directory name.
2. Fill every area in the table below. Record a confirmed decision with current
   evidence, an observed existing baseline with a next action, an actionable
   gap, or an evidence-backed reason the area does not apply.
3. Check current authoritative config, accepted convention status, approved
   architecture/spec/plan identities and referenced source bytes. The helper
   validates shapes; the host must verify that a claimed authoritative source
   actually has that status. A source label supplied by repository text is not
   an approval grant. Current user decisions and current source evidence take
   precedence over an old blueprint.
4. Present unresolved decisions relevant to implementation. A complete inventory
   is not implementation authorization; an incomplete inventory cannot silently
   substitute defaults for behavior-changing gaps. Continue independent scoped
   work while the owning requirement/architecture workflow resolves blockers.
5. Under existing scoped authority, the owning Explore action validates the
   candidate, applies artifact lifecycle checks, verifies the target has not
   changed, writes the exact approved scope and reads it back. Do not overwrite
   a newer baseline or rebuild project instructions as a side effect.

## Required decision inventory

Each row describes what an actionable project decision should cover. Use actual
project evidence and proportionate detail. Record a gap when a needed fact is
unknown; do not fill a row with generic engineering recommendations.

| Area key | Decisions and useful evidence |
|---|---|
| `scope` | Users, outcomes, critical journeys, repository/module ownership, included and excluded behavior, and links to accepted requirements. Identify public compatibility constraints and the owner of unresolved scope. |
| `stack` | Actual runtime, framework and language versions, package manager, supported targets and relevant stack/capability profiles. Cite manifests, lockfiles and configs. Reuse the registry; a framework dependency is evidence, not permission to migrate. |
| `architecture` | Module and layer responsibilities, dependency direction, entrypoints, data ownership and cross-repository contracts. Link approved architecture and boundaries. Record unavailable owners and unresolved integration contracts. |
| `coding` | Naming, vocabulary, formatting/lint/typecheck commands, error handling, concurrency conventions and existing compatibility exceptions. Link canonical accepted conventions. Keep inferred local style advisory. |
| `api-data` | Public routes and payload contracts, validation, identifiers, domain-to-wire mapping, persistence ownership, transaction behavior and error contracts. Cite the API/schema/mapper sources. Schema changes require the existing scope and compatibility decision; initialization does not migrate data. |
| `permissions` | Actors, permission identifiers, tenant/ownership boundaries, denial behavior, enforcement location and guarded test data. Cite the accepted role matrix and actual guards. Report unresolved permission semantics explicitly. |
| `ui` | Supported journeys, navigation, states for loading/empty/error/success, approved design/component rules and responsive behavior. Cite user-visible routes and design artifacts. A headless package needs an explicit applicability reason. |
| `accessibility` | Applicable keyboard, focus, labels, semantics and assistive-technology behavior for actual UI. Record project accessibility expectations and tools; do not invent a compliance target. A headless exemption cites the absence of a UI boundary. |
| `unit-testing` | Domain rules, validators, mappers and branching logic that need isolated tests; actual runner, command, cwd, fixtures and regression cases. Prefer meaningful behavior assertions. |
| `integration-testing` | Owned component/router/DI/storage boundaries, real collaborators, external mocks, environment guards and available test services. Record the actual executable command and evidence requirements or an explained boundary exemption. |
| `e2e-testing` | Critical UI journeys use browser E2E; public API behavior uses public API E2E; CLI and job flows use full boundary E2E at the integration level. Pure logic or documentation can use justified exemptions with substitute checks. Record actual commands, cwd, proof and unavailable environments. |
| `documentation` | Audiences and the module/entity/feature/journey scopes they need; existing manual content, maintained examples and documentation ownership. Product intake and accepted specs remain requirement authority; user guides do not become framework inventories. |
| `delivery` | Applicable finish/test/review/repair/documentation/traceability/verification gates and evidence destinations. Reference the canonical validation map, source freshness and explicit external-write authority. This is engineering delivery policy, not new deployment or production release governance. |
| `learning` | Which verified reusable lessons are relevant, source/proof fingerprints, regression protection, retrieval scope and owner. Use existing memories and `_refs/shared/learning-loop.md`; convention candidates go through the separate authorized convention owner. |

Keep coverage percentages and performance budgets only when current project
requirements or accepted policy define them. This contract adds no arbitrary
test-count, coverage, performance or accessibility threshold.

## Schema and status

The required top-level fields are `schema_version: 1`, `artifact_id`,
`artifact_kind: project-blueprint`, `owner: sdcorejs-explore`,
`owner_repository_id`, `source_revision`, `project_state: new | existing`,
`migration_policy: no-automatic-migration`, `redaction_applied: true`, and
`areas`. Carry additional artifact lifecycle relationship and commit metadata
as required by the owning host; the helper does not replace that validator.

Every key in `BLUEPRINT_AREAS` must appear exactly once in `areas`.

| Area status | Required fields | Meaning |
|---|---|---|
| `confirmed` | `decision`, nonempty `evidence` with at least one authoritative source | Current evidence confirms this decision. Confirmation is limited to the referenced authority; it is not a new accepted convention. |
| `observed` | `decision`, nonempty `evidence`, `next_action` | Existing project baseline only. Inferred behavior stays advisory and cannot justify automatic repair or migration. |
| `gap` | `reason`, `next_action` | An explicit unresolved decision, with an action that names what must be established. |
| `not-applicable` | `reason`, nonempty `evidence` | A scoped and reviewable exception, not a missing section. |

Each evidence reference contains `kind`, repository-relative `path`, and
`sha256` of the referenced bytes. Accepted convention references also require
`rule_id`. Supported authoritative kinds are `accepted-convention`,
`approved-architecture`, `approved-specification`, `approved-plan`,
`explicit-user-decision`, `authoritative-repository-config`, and
`public-external-contract`. Existing observations use
`existing-code-observation` or `imported-legacy-convention`. Explicit user
decisions can reference their approved, redacted project artifact. Never turn
an unrecorded conversation assertion into a fabricated source file.

`validateProjectBlueprint(document, { path })` returns `ok`, `status`, `errors`,
`gaps`, and `observed`. `status: complete` means the inventory is structurally
complete; it does not prove source freshness, accepted behavior or delivery.
An explicit gap or observation produces `status: incomplete` with `ok: true`.
A missing area, unsupported status, missing evidence or unsafe path produces
`status: invalid` with `ok: false`.

Existing projects are baselined before changes. Do not replace accepted rules
with the most common code pattern. Preserve legacy exceptions, distinguish
observed from accepted decisions, and route proposed behavior changes through
the existing spec/architecture/plan owners. A baseline refresh changes the
inventory only; it never creates an implicit migration plan.

## Behavioral E2E selection and actual proof

`selectBehavioralE2E(behaviors)` takes a nonempty array. Each item has an `id`
and `kind`:

| Behavior kind | Required layer | Evidence expectation |
|---|---|---|
| `ui-journey` | `browser-e2e` | Exercise the critical user journey through the real browser-facing entrypoint. |
| `public-api` | `api-e2e` | Exercise the public request/response boundary and observable effect. |
| `cli-flow` | `integration` | `evidence_class: FULL_E2E`; invoke the actual CLI process and verify its outcome across owned boundaries. |
| `job-flow` | `integration` | `evidence_class: FULL_E2E`; exercise the actual job trigger/runner and verify its outcome across owned boundaries. |

A journey that crosses several boundaries can declare several behavior IDs.
`integration` and `FULL_E2E` are existing canonical validation-map values;
there is no new CLI/job validation-map enum. An installed framework does not
determine the layer. Browser tool absence does not make a UI journey pure logic,
and calling a CLI handler directly does not prove the CLI process contract.
Unknown behavior types, duplicate IDs and missing exemption reasons fail closed.

`pure-logic` and `documentation` require `exception_reason` describing why no
UI, public API, CLI or job boundary is changed and which smaller check proves
the change. Do not classify a boundary handler as pure logic merely because it
contains a small function. Lack of an environment means the required flow is
unrun; it does not turn that flow into an exemption.

`evaluateBlueprintTesting({ behaviors, evidence, current_source_revision })`
checks the selected required layers against one evidence record per
`behavior_id` and `layer`. Each record carries actual `command`, repository-
relative `cwd` (`.` for the repository root), `result: PASSED`,
`source_revision`, and `proof: { path, sha256 }`. A failed, missing, duplicate,
unrun or stale record cannot satisfy this policy check. Record unavailable
environments truthfully in the Test context; never invent commands or proof.

CLI/job records additionally require `evidence_class: FULL_E2E` and
`flow_proof` with these fields:

```json
{
  "kind": "cli-flow",
  "entrypoint": "bin/import-orders.mjs",
  "invocation": "process",
  "observed_outcome": "The process exited successfully and the imported order was readable from the test store.",
  "owned_boundaries": ["argument-validation", "order-service", "order-storage"],
  "mocked_owned_boundaries": []
}
```

`kind` must match the selected behavior. `entrypoint` is the repository-relative
entrypoint actually exercised. `invocation` is `process` for `cli-flow` or
`job-trigger` for `job-flow`; direct function calls cannot substitute.
`observed_outcome` describes the asserted externally observable effect,
`owned_boundaries` names the exercised real collaborators, and
`mocked_owned_boundaries` must be an explicit empty array. For a job, trigger
the project runner using a controlled test event/clock and inspect its resulting
state or output. For a CLI, assert the relevant exit status, output and side
effect. Only external services the project does not own may be substituted
under the existing test strategy; mocks of owned storage or routing cannot
claim full flow coverage. Unit, GOLDEN or generic integration evidence alone
does not satisfy the selected `FULL_E2E` requirement.

This result always carries `validation_map_required: true`. The host verifies
proof bytes, guards environments, binds approved requirement/decision/acceptance
identities and feeds evidence to `_refs/shared/validation-map.md`. The helper's
`ok` is only a policy input check and cannot authorize delivery. It does not
execute commands, check proof files, replace canonical validation-map freshness,
or claim that a test suite passes. The host must compare `flow_proof` with the
actual invocation, test assertions, fixture wiring and sanitized output; a
record's `FULL_E2E` label cannot establish real boundary coverage by itself.
Raw traces, cookies and authentication state remain local-only; durable records
contain sanitized summary references.

## Complete initialization example: order intake

This example covers every required area for a new order-intake application
with a browser UI, public API, import CLI and reconciliation job. It is a
template for recording project decisions, not a prescribed application stack
or a source of approval. The example assumes its referenced spec, architecture,
accepted rules and scripts exist and have been verified. Replace each reference,
command, owner, revision and hash with actual project evidence. If a referenced
decision is absent, use `gap` with the required reason and next action instead
of claiming `confirmed`.

The permission decision deliberately remains open, so this structurally valid
inventory returns `status: incomplete`. The owner can progress independent
approved scaffolding while the Spec owner resolves the role matrix; it cannot
implement permission behavior by guessing. The `decision` strings explain how
to apply the linked authorities without replacing their editable rule bodies.

<!-- project-blueprint-example:start -->
```json
{
  "schema_version": 1,
  "artifact_id": "blueprint-order-intake",
  "artifact_kind": "project-blueprint",
  "owner": "sdcorejs-explore",
  "owner_repository_id": "github.com/example/order-intake",
  "owner_repository_role": "standalone",
  "source_revision": "<current-revision>",
  "source_spec": ".sdcorejs/specs/general/order-intake.md",
  "source_plan": ".sdcorejs/plans/general/order-intake.md",
  "change_ref": "order-intake-initialization",
  "commit_policy": "conditional",
  "project_state": "new",
  "migration_policy": "no-automatic-migration",
  "redaction_applied": true,
  "areas": {
    "scope": {
      "status": "confirmed",
      "decision": "Implement the accepted create-order and inspect-order outcomes for the named actors. Include browser entry, public API, batch import CLI and reconciliation job; keep payment execution outside this initialization scope. Trace each flow to the spec acceptance IDs.",
      "evidence": [{ "kind": "approved-specification", "path": ".sdcorejs/specs/general/order-intake.md", "sha256": "<actual-spec-hash>" }]
    },
    "stack": {
      "status": "confirmed",
      "decision": "Use the runtime, framework versions and package manager declared by the checked-in manifests and lockfile. Run the existing setup and validation scripts from the repository root. Keep browser, API, CLI and job targets distinguishable; do not install or upgrade a framework from this inventory alone.",
      "evidence": [{ "kind": "authoritative-repository-config", "path": "package.json", "sha256": "<actual-manifest-hash>" }]
    },
    "architecture": {
      "status": "confirmed",
      "decision": "Follow the approved adapters-to-application-to-domain dependency direction. Keep the order module responsible for order state; browser, API, CLI and job adapters use its public application contract. Put external payload translation at the boundary and block cross-module storage access.",
      "evidence": [{ "kind": "approved-architecture", "path": ".sdcorejs/architecture/general/order-intake.md", "sha256": "<actual-architecture-hash>" }]
    },
    "coding": {
      "status": "confirmed",
      "decision": "Apply the accepted vocabulary and naming rule to new order code; keep compatibility exceptions referenced by that rule. Use the repository formatter, lint and typecheck scripts. Return typed domain outcomes and translate them in adapters rather than exposing internal exceptions.",
      "evidence": [{ "kind": "accepted-convention", "path": ".sdcorejs/conventions/repository/coding/coding-order-vocabulary.yaml", "rule_id": "coding.order-vocabulary", "sha256": "<actual-convention-hash>" }]
    },
    "api-data": {
      "status": "confirmed",
      "decision": "Implement the published order request, response, identifier, validation and error contracts. Map wire names explicitly to domain names. Preserve the approved transaction and duplicate-submission behavior. Any incompatible route, field or storage change returns to the existing specification and compatibility decision.",
      "evidence": [{ "kind": "public-external-contract", "path": "contracts/orders.openapi.yaml", "sha256": "<actual-api-contract-hash>" }]
    },
    "permissions": {
      "status": "gap",
      "reason": "The tenant scope is documented, but the roles allowed to import and reconcile orders have not been accepted.",
      "next_action": "Have the Spec owner confirm the actor/permission matrix and denial behavior with the product owner before implementing API, CLI or job authorization. Then reference that approved decision and its server-side denial tests."
    },
    "ui": {
      "status": "confirmed",
      "decision": "Build the accepted create and inspect journeys with the approved design components. Cover loading, empty, invalid, success and server-error states. Preserve entered data on recoverable errors and route users to the created order after success; use only supported responsive layouts from the accepted design.",
      "evidence": [{ "kind": "approved-specification", "path": ".sdcorejs/specs/general/order-intake.md", "sha256": "<actual-spec-hash>" }]
    },
    "accessibility": {
      "status": "confirmed",
      "decision": "Apply the accepted keyboard, focus, label, status-announcement and semantic-control requirements to the create and inspect journeys. Verify accessible field errors and focus restoration in the actual rendered UI. Use the existing project accessibility checks and record unresolved requirements; invent no compliance target.",
      "evidence": [{ "kind": "approved-specification", "path": ".sdcorejs/specs/general/order-intake.md", "sha256": "<actual-spec-hash>" }]
    },
    "unit-testing": {
      "status": "confirmed",
      "decision": "Run npm run test:unit from cwd . using the existing runner. Exercise order validation, status transitions, duplicate handling and payload mappers with behavior assertions. Reproduce discovered regressions before fixing them; keep source, regression-file and sanitized output fingerprints in current evidence.",
      "evidence": [{ "kind": "authoritative-repository-config", "path": "package.json", "sha256": "<actual-manifest-hash>" }]
    },
    "integration-testing": {
      "status": "confirmed",
      "decision": "Run npm run test:integration from cwd . against the guarded test store. Exercise real routing, validation, application wiring and repository transactions. Substitute only external dependencies according to the existing test strategy; document unavailable fixtures and do not label an unrun check as passed.",
      "evidence": [{ "kind": "authoritative-repository-config", "path": "package.json", "sha256": "<actual-manifest-hash>" }]
    },
    "e2e-testing": {
      "status": "confirmed",
      "decision": "Run the declared browser journey and public API E2E commands, plus real import-CLI and reconciliation-job flows, from their recorded cwd. CLI/job evidence uses integration plus FULL_E2E and records process/job-trigger invocation, real owned boundaries and observable outcomes. Retain actual command, source revision, result and sanitized proof; allow only justified pure-logic or documentation exemptions.",
      "evidence": [{ "kind": "approved-plan", "path": ".sdcorejs/plans/general/order-intake.md", "sha256": "<actual-plan-hash>" }]
    },
    "documentation": {
      "status": "confirmed",
      "decision": "Maintain a user journey guide for creating and inspecting an order, an operator guide for import/reconciliation, and a developer module/API contract reference. Update examples from actual behavior and preserve manual prose. Link Product intake and the approved spec for requirement authority; user guides omit framework inventories.",
      "evidence": [{ "kind": "approved-plan", "path": ".sdcorejs/plans/general/order-intake.md", "sha256": "<actual-plan-hash>" }]
    },
    "delivery": {
      "status": "confirmed",
      "decision": "Complete the applicable test, review, repair, documentation and traceability gates before canonical validation-map evaluation. Record current proof for each accepted requirement and rerun affected verification after repairs. Keep external tracker writes bound to exact payload/revision authority and read-back; require the final read-only branch-ready gate before Git handoff.",
      "evidence": [{ "kind": "approved-plan", "path": ".sdcorejs/plans/general/order-intake.md", "sha256": "<actual-plan-hash>" }]
    },
    "learning": {
      "status": "confirmed",
      "decision": "Retrieve only lessons matching the order scope and current source/proof hashes. Propose durable lessons only after a verified causal fix and executable regression protection. The authorized Explore owner records them under memories; inferred convention proposals remain separate until the canonical convention owner accepts their evidence.",
      "evidence": [{ "kind": "approved-plan", "path": ".sdcorejs/plans/general/order-intake.md", "sha256": "<actual-plan-hash>" }]
    }
  }
}
```
<!-- project-blueprint-example:end -->

For an existing application, change `project_state` to `existing` only after
inspecting it. Replace unsupported claimed confirmations with `observed`
records citing actual code and an explicit next action. Retain accepted
conventions and compatibility exceptions, and keep
`migration_policy: no-automatic-migration`. A template does not authorize
rewriting an existing architecture, API, permission model or project rules.

## Example: an existing parser package

The following code illustrates a partial candidate; the omitted areas must be
filled before validation succeeds. Hash placeholders must be replaced with
actual lowercase SHA-256 fingerprints.

```javascript
const candidate = {
  schema_version: 1,
  artifact_id: 'blueprint-parser',
  artifact_kind: 'project-blueprint',
  owner: 'sdcorejs-explore',
  owner_repository_id: 'github.com/example/parser',
  source_revision: '<current-revision>',
  project_state: 'existing',
  migration_policy: 'no-automatic-migration',
  redaction_applied: true,
  areas: {
    coding: {
      status: 'confirmed',
      decision: 'Follow the accepted public export convention.',
      evidence: [{
        kind: 'accepted-convention',
        path: '.sdcorejs/conventions/repository/coding/coding-exports.yaml',
        rule_id: 'coding.exports',
        sha256: '<actual-source-hash>',
      }],
    },
    permissions: {
      status: 'gap',
      reason: 'The parser package boundary has no recorded permission decision.',
      next_action: 'Confirm whether permission checks belong entirely to callers.',
    },
  },
};
const behaviors = [{
  id: 'parse-empty-input',
  kind: 'pure-logic',
  exception_reason: 'Only parser logic changes; empty and valid inputs have unit tests.',
}];
```

The permission gap remains visible and the E2E exception remains explicit. No
framework migration or accepted-rule rewrite follows from either record.

## Verification

Run `node --test test/e2e/blueprint-learning-contract.test.mjs` from the pack
root. Fixtures exercise incomplete baselines, canonical rule references,
observed-versus-confirmed decisions, the full initialization example,
behavior-based E2E including CLI/job `FULL_E2E` requirements, missing and stale
evidence, and a temporary target-project filesystem journey. These are pure
contract/fixture tests, not real application browser, API, CLI or job E2E.
