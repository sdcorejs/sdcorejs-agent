# Delivery Convergence Contract v1

## Purpose

Delivery convergence is the final deterministic comparison between approved
intent and current delivery evidence. It answers one question: does the current
source still prove the change that was authorized?

The executable source is `_refs/shared/convergence-contract.mjs`. It consumes
portable projections produced by existing workflows. It does not inspect or
mutate a repository, approve an artifact, execute a test, or persist a ledger.
It does not create a new skill or grant write authority. In particular, it does not grant Git authority.
A caller must still apply the owning ship, branch-ready, and Git
contracts.

## Convergence chain

Feature convergence follows the complete relationship chain:

```text
approved intent
  -> current requirement / decision / assumption set
  -> approved spec
  -> approved architecture when required
  -> approved plan
  -> executed tasks
  -> changed files and symbols
  -> validation map
  -> current test and review evidence
  -> architecture and convention conformance
  -> documentation, Product, and Design ledgers
  -> artifact closure
```

Every edge is explicit. A passing command is not proof unless its evidence
references the relevant requirement, acceptance criterion, task, path, symbol,
invariant, and concrete planned validation case. An automated covered row with
an empty case set is not proof. Missing input blocks; the evaluator never
treats an empty collection as proof.

That full intent graph applies to `feature` mode. Specialized modes still
require executed task to exact changed path/symbol to current evidence links,
but their feature-only requirement, acceptance-criterion, invariant, risk, and
validation-map collections may be empty. This is intentional: a bugfix, docs
change, or dependency update must not fabricate feature artifacts to converge.
Within a feature graph, every edge must be reciprocal and each validation row
must be proved by its own referenced evidence; proof cannot be pooled across
cross-wired rows.

## Portable input

`validateConvergenceInput` accepts `schema_version: 1` and validates these
top-level projections:

- `mode`, `change_ref`, `thread`, and current `source` identity;
- approval and artifact graph/hash states in `artifacts`;
- approved path and symbol bounds in `approved_scope`;
- `requirements`, `acceptance_criteria`, `invariants`, `risks`, and `tasks`;
- `changes`, `validation_map`, and current `evidence` with exact references;
- architecture, convention, and public-contract conformance;
- generated mirrors, summary, dependency/toolchain, and engine state;
- Product, Design, and documentation ledger requirements;
- verification order, artifact closure, and thread ownership in `lifecycle`;
- the selected debug, documentation-hygiene, or dependency-regression mode
  contract.

Repository revisions are lowercase 40-character revisions. Evidence carries
the exact source revision, source fingerprint, portal revision, and module
revision map. Paths are safe repository-relative paths. Symbols use
`<repository-relative-path>#<symbol>`. Canonical IDs and every reference are
checked for duplicates and dangling targets before evaluation.

## Modes

The evaluator supports four modes and does not silently substitute one chain
for another. Mode evidence references must resolve to current `PASSED`
evidence and must cover every changed path.

| Mode | Required chain |
|---|---|
| `feature` | Approved intent, current decision set, approved spec, required approved architecture, approved plan, execution, validation, and closure |
| `bugfix` | Ready debug contract plus reproduced current evidence; a missing spec is valid and no spec is fabricated |
| `docs-only` | Explicit `documentation-only` changed-scope classification plus passed text/layout hygiene evidence |
| `dependency-regression` | Explicit `dependency-only` changed-scope classification, changed paths bound to declared manifest/lock paths and evidence, plus dependency fingerprint, toolchain, and runtime-engine agreement |

In every mode, `spec`, `architecture`, and `plan` remain optional when declared
`required: false`. If a caller explicitly declares any of them `required:
true`, a missing, stale, or unverified artifact blocks with
`REQUIRED_ARTIFACT_MISSING`; specialized modes do not ignore an explicit
requirement.

Validation rows with `automation: manual`, `automation: deferred`, or
`status: deferred` require a reason, owner, and explicit acknowledgement. They
produce `DEFERRED`, even when an attached evidence record says `PASSED`;
manual or deferred evidence never becomes automatic proof.

## Twenty drift guards

`CONVERGENCE_DRIFT_CODES` is the exact executable drift vocabulary. Blockers
are deduplicated and sorted by code, path, and message.

| Code | Blocking condition |
|---|---|
| `REQUIREMENT_WITHOUT_IMPLEMENTATION_OR_EVIDENCE` | An approved requirement lacks an executed task or current proving evidence. |
| `AC_WITHOUT_PROVING_TEST` | An acceptance criterion lacks complete covered validation rows bound to current passing evidence. |
| `UNRELATED_PASSING_TEST` | Passing evidence is unbound or does not prove the mapped requirement, acceptance criterion, task, invariant, path, symbol, and planned case. |
| `UNTRACED_TASK` | A task lacks requirement, acceptance criterion, invariant, risk, exact changed path/symbol, or evidence linkage. |
| `CHANGE_OUTSIDE_APPROVED_INTENT` | A changed path/symbol is outside approved scope or lacks intent linkage. |
| `PLANNED_OR_CHANGED_PATH_DRIFT` | A planned mutable path was not changed, an unplanned path changed, or task path projection disagrees. |
| `REQUIRED_ARCHITECTURE_MISSING` | An architecture-required change lacks a verified approved architecture snapshot. |
| `ARCHITECTURE_INVARIANT_VIOLATION` | Current implementation violates one or more `INV-*` records. |
| `ACCEPTED_CONVENTION_VIOLATION` | A current accepted convention is violated. |
| `OBSERVED_CONVENTION_USED_AS_BLOCKER` | An observed convention was marked blocking or used to authorize repair. |
| `CONFORMANCE_EVIDENCE_STALE_OR_CONFLICTED` | Architecture or convention evidence is stale, conflicted, or non-conformant. |
| `PUBLIC_CONTRACT_MIGRATION_DECISION_MISSING` | A public contract change has no approved migration, deprecation, or compatibility decision. |
| `APPROVED_ARTIFACT_GRAPH_OR_HASH_STALE` | An approved artifact hash or parent graph is missing, stale, or mutated. |
| `MODULE_PORTAL_REVISION_MAP_MISMATCH` | Portal, module, pinned, source, or evidence revision provenance disagrees. |
| `GENERATED_MIRROR_STALE` | A required generated mirror is missing or stale. |
| `SUMMARY_OR_DEPENDENCY_TOOLCHAIN_FINGERPRINT_STALE` | The required summary or dependency/toolchain fingerprint is stale. |
| `MANIFEST_LOCKFILE_RUNTIME_ENGINE_DRIFT` | Manifest, lockfile, or runtime-engine contracts disagree. |
| `REQUIRED_LEDGER_MISSING` | A required Product, Design, or documentation ledger is missing or stale. |
| `POST_VERIFICATION_WRITE` | Source/evidence drifted after verification or a write occurred after verification/branch-ready. |
| `ARTIFACT_CLOSURE_OR_THREAD_OWNERSHIP_INVALID` | Artifact closure is incomplete or includes artifacts owned by another thread. |

Accepted convention violations block. Observed convention findings remain
advisory: they never block and never authorize repair. Architecture and
convention inputs must independently state current, non-conflicted evidence.

## Result and assertion

`evaluateConvergence` returns a compact deterministic projection:

```yaml
schema_version: 1
change_ref: <change id>
mode: feature | bugfix | docs-only | dependency-regression
status: CONVERGED | BLOCKED | DEFERRED
fresh: true | false
source_identity:
  repository_id: <repository id or null>
  revision: <revision or null>
  fingerprint: <source fingerprint or null>
  portal_revision: <portal revision or null>
  module_revision_map: {}
  pinned_module_revision_map: {}
  owner_thread_id: <owner thread id or null>
blocker_codes: []
blockers: []
evidence_refs: []
summary:
  requirements: <positive for feature; zero allowed for specless modes>
  acceptance_criteria: <positive for feature; zero allowed for specless modes>
  tasks: <positive for every mode>
  changed_paths: <positive for every mode>
  evidence: <exact evidence_refs count>
provenance:
  evaluator: sdcorejs-convergence:v1
  input_hash: sha256:v1:<64 lowercase hex>
  projection_hash: sha256:v1:<64 lowercase hex>
```

It never echoes raw artifact bodies, file contents, or evidence logs.
`assertConvergence` returns only a fresh `CONVERGED` result; it throws with the
sorted blocker projection for `BLOCKED`, `DEFERRED`, or stale results.
`createConvergenceReceiptArtifact` evaluates canonical input atomically and
seals only its fresh `CONVERGED` projection as verified `release-evidence`.
The receipt carries the canonical input/result pair so every handoff can rerun
the evaluator; its metadata also binds input/projection hashes, change, mode,
repository, and revision.

## Integration boundary

The load-bearing consumers are existing workflows, not a new public skill:

- execute-plan emits task to path/symbol to requirement/acceptance
  criterion/invariant/risk links;
- test emits current evidence references for the approved validation map;
- review emits architecture and convention states, keeping observed findings
  advisory;
- verify-before-done evaluates convergence;
- branch-ready confirms the compact result and receipt still match current source;
- ship context carries the compact result and verified receipt;
- the Git workflow rejects a missing, blocked, deferred, or stale required
  result under its own authorization contract.

`evaluateConvergenceHandoff` fails closed at branch-ready, ship readiness, and
Git closure. It verifies the receipt and projection checksum, rejects vacuous
feature/bugfix counts, and compares the result with independently derived
change, mode, repository revision/fingerprint, portal/module/pin maps, and
owner thread. Git derives these values from repository topology and approved
plans rather than trusting a co-mutable `convergence_current`. These consumers
remain responsible for authorization; the receipt never grants a write.
