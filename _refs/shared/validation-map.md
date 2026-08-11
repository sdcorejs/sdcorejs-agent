# Validation Map Contract

This contract extends `_refs/shared/test-scope-and-coverage.md`; it does not
replace that risk-selection guide or create a second coverage authority. The
approved `plan_context.validation_map` is the planning authority. At runtime,
`test_context.coverage_matrix` is its exact structured projection, while
`test_evidence` appends actual runs, cases, and acknowledgements.
The decision coverage used as boundary authority must match its verified
`decision-coverage:v1` approved artifact; a caller cannot co-mutate the row and
decision record to downgrade authorization.

Use `_refs/shared/validation-map.mjs` for deterministic validation, projection,
and current-evidence evaluation. Do not reproduce its rules in another helper.

## Canonical row

```yaml
validation_map:
  - requirement_id: R-001
    acceptance_criterion_id: AC-001
    invariant_refs: [INV-001]
    risk: authorization
    boundary:
      kind: authorization # authorization | none
      approval_ref: D-001
      source_refs: [R-001, AC-001, INV-001]
    authorization_boundary: true
    levels: [api-e2e, browser-e2e]
    case_ids: [case-orders-viewer-denied]
    planned_command: npm run test:api -- orders-viewer-denied
    command_source: package.json # package.json | ci | project-doc | manual
    cwd: packages/orders
    evidence_class: FULL_E2E # UNIT | GOLDEN | CONTAINER | FULL_E2E | LIVE_AGENT | SUPPLEMENTAL_SMOKE
    automation: automated # automated | manual | deferred | not-applicable
    expected_proof: The server denies an unauthorized viewer.
    status: covered # covered | partial | deferred | missing | not-applicable
    evidence_refs: [EVIDENCE-001]
    rationale: null
    owner: null
    acknowledgement_required: false
    module_e2e: false
    module_id: null
    owner_repository_id: null
```

Rows preserve canonical `R-###`, `AC-###`, and `INV-###` identities from
`decision_coverage`. Every active acceptance criterion needs a row; references
must resolve, the AC must belong to the requirement, and case IDs are globally
unique. `partial` or `missing` blocks plan approval.

## Selection rules

- Choose the smallest proving layer. Do not force every behavior into E2E.
- Pure transformations normally use unit evidence; adapters and data boundaries
  use integration evidence; public HTTP behavior uses API E2E; critical user
  journeys may add browser E2E; UAT remains human evidence.
- Declare `authorization_boundary` explicitly and bind it to the structured
  approved `boundary` projection. `approval_ref` must resolve to a current
  `D-###` record whose `validation_boundary.kind` and typed `source_refs`
  exactly match the row; free-form prose and risk labels never decide the gate.
  The decision record itself is accepted only when the whole decision-coverage
  projection matches its approved artifact body and hash.
  `authorization_boundary` must agree with that approved projection, and an
  authorization boundary requires server/API denial evidence.
  A hidden or disabled client control cannot prove authorization.
- Discover exact commands, source, and cwd. Use `null` only when no automated
  command applies; do not invent a script or silently change package manager.
- Do not invent a numeric coverage threshold. Preserve a project threshold only
  as discovered configuration evidence outside this row contract.
- `not-applicable` and `deferred` need a concrete rationale. Manual and deferred
  rows also need an owner and an explicit acknowledgement requirement.

## Lifecycle and evidence

The states are deliberately distinct: planned is not authored, authored is not
executed, executed is not passed, and a passed command cannot cover an AC whose
mapped case is absent. Manual acknowledgement produces `MANUAL`, never an
automated `PASS`; deferred evidence remains `DEFERRED`. A manual-only evidence
envelope uses `executability: not-applicable`, `execution: not-run`,
`result: not-applicable`, and `evidence: current`; its current owner-bound
acknowledgement is the proof, so no fabricated automated run is required.

Each automated case must name its exact test reference and actual run. Current
evidence binds all of the following:

- exact `associated_HEAD_or_diff`;
- exact planned command, command source, and cwd;
- runner configuration and environment fingerprints;
- planned evidence class;
- non-interrupted zero-failure execution and a passing mapped case;
- explicit `stale: false`.

A write affecting any bound input makes prior evidence stale. Every row must
explicitly declare `module_e2e`. A true value also requires `module_id` and
`owner_repository_id`; evaluation consumes `current.module_e2e` discovery
scope and delegates to `_refs/shared/module-e2e-contract.mjs`. That canonical
contract binds repository identity, source fingerprint, portal/module/pinned
revisions, manifest argument-array command, and artifact hashes. It also maps
the validation-map `FULL_E2E` spelling to the module contract's `full-e2e`
spelling at the boundary. Omitting module scope cannot bypass provenance.
Golden, container, live-agent, and supplemental-smoke evidence never substitute
for a required class.

## Runtime handoff

1. Plan calls `validateValidationMap`/`assertValidationMap` against the approved
   `decision_coverage` before approval.
2. Test calls `projectCoverageMatrix` without rewriting, merging, dropping, or
   inferring rows, then appends actual runs/cases and validated current
   `test_evidence.convergence_evidence_refs`.
3. Review preserves the map and reports traceability or freshness findings; it
   does not change planning authority.
4. Ship calls `evaluateValidationEvidence` with the approved map, exact runtime
   projection, current evidence, and current fingerprints. Drift, stale proof,
   missing cases, manual acknowledgement gaps, or deferred evidence block an
   automated ready verdict.

Legacy coverage lists are historical input only. They may inform a new approved
map, but they are not silently treated as complete or current evidence.
