# Product Traceability

Traceability maps approved requirement identity to implementation,
verification, UAT, and evidence without allowing those artifacts to redefine
the requirement. This reference owns active/history discovery, artifact roles,
independent status dimensions, gap classification, drift, compatibility
projection, and deterministic verdict derivation.

## Contents

- [Inputs And Discovery](#inputs-and-discovery)
- [Active And History Discovery](#active-and-history-discovery)
- [Artifact Roles](#artifact-roles)
- [Mapping Algorithm](#mapping-algorithm)
- [Independent Status Dimensions](#independent-status-dimensions)
- [Gap Taxonomy](#gap-taxonomy)
- [Drift And Conflicting Authority](#drift-and-conflicting-authority)
- [Requirement Readiness](#requirement-readiness)
- [Feature Verdict](#feature-verdict)
- [Legacy Status Projection](#legacy-status-projection)

## Inputs And Discovery

Start from normative identity, then collect descriptive artifacts:

1. Immutable approved spec for the exact `contract_id`, revision, path, and
   hash.
2. Approved product projections and decisions for that same identity.
3. Existing active ledger, immutable history, and safely attributable legacy
   ledgers.
4. Approved plan and design handoff as execution and support context.
5. Current implementation paths, configuration, routes, APIs, permissions,
   schemas, and relevant Git diff.
6. Current test files and accepted evidence records.
7. UAT scenario definitions and explicit UAT execution records.
8. Summaries and older reports as discovery hints only.

Do not create a requirement from an implementation path or test assertion. Do
not treat a plan, summary, or old ledger as current authority when its contract,
revision, or source hash differs.

## Active And History Discovery

Discovery is contract-first and non-destructive:

1. Use explicit paths from a validated incoming `product_context` only when
   their content identifies the same `contract_id` and revision lineage.
2. Search established target product and ledger layouts for records containing
   the exact `contract_id`. Existing layout wins when there is exactly one
   current candidate and no different contract owns the same path.
   Final authorization repeats this discovery with
   `observeProductLayoutState`, which recursively enumerates regular,
   non-linked `.sdcorejs/docs/product/**/current.md` files and binds matching
   paths plus content hashes to the one-shot decision. Caller-provided
   candidates cannot narrow that set.
3. Follow an established active index to its current record, then verify the
   target exists, its identity matches, and its history links stay inside the
   target project.
4. Discover contract-key fallback paths under
   `.sdcorejs/docs/product/{contract-key}/current.md`, `history/`, and `uat/`.
5. Discover legacy timestamped ledgers by explicit contract ID first. A
   contract-less file may be linked only when approved source path/hash,
   requirement IDs, feature identity, and surrounding index prove one unique
   mapping.
6. Record all candidates, chosen path, rejected paths and reasons, immutable
   history paths, legacy mappings, and collisions in `product_context.layout`.

Zero current candidates permits the collision-safe fallback. More than one
valid current candidate, one current path claimed by different contracts, a
broken active index, or an ambiguous legacy mapping produces a blocking gap and
no write. Never choose the newest timestamp as a substitute for identity.

Legacy files remain unchanged. A successful migration creates only a new
active index/current record and `legacy_history` links after preflight.

## Artifact Roles

Assign one role before deciding whether an artifact is a gap.

| Role | Applies to | Classification rule | Gap behavior |
|---|---|---|---|
| `requirement_implementation` | code/config/design artifact | Maps to a stable requirement ID or approved behavior key and implements observable intent | contributes implementation evidence |
| `requirement_verification` | test/manual verification artifact | Maps to a stable requirement ID or approved behavior key | contributes verification evidence when its evidence record is acceptable |
| `supporting_implementation` | refactor, adapter, mapper, internal utility, migration support | Is non-observable and declares `supports` for mapped behavior | never scope creep by itself and never proves the requirement implemented alone |
| `supporting_verification` | harness, fixture, helper, setup | Supports verification without asserting new observable behavior | never orphan behavior by itself |
| `control_verification` | security, regression, infrastructure, compatibility control | Maps to a control requirement such as `SEC-001`, not necessarily a user story | valid control evidence; no story mapping required |
| `unapproved_behavior` | route, permission, workflow, API, validation, or other observable implementation | Observable behavior has no approved requirement mapping | blocking `unapproved_scope`; required action is approved `requirements-update` or removal from code |
| `orphan_behavior_assertion` | test assertion | Asserts observable product behavior with no requirement or control mapping | non-blocking by default, but review for hidden scope or obsolete coverage |
| `unmapped_implementation` | implementation with insufficient classification evidence | Neither proven support nor proven observable behavior | `mapping_unknown`; never silently treated as covered |

A path may provide multiple typed artifact records when it serves different
requirements. Each record has a stable artifact ID, path, relevant anchor or
symbol, content hash, role, requirement/control IDs, and evidence references.

## Mapping Algorithm

For deterministic mapping:

1. Build the requirement set from the `requirements`,
   `requirement_field_hashes`, and `requirement_source_hashes` returned by the
   trusted file-backed `verifyApprovedSpecAuthority` result. Both normative
   snapshots must match that complete projection and both hash maps exactly.
   Keep source path, anchor, revision, and
   hash with every row; do not copy the full requirement into the ledger.
   `deriveTraceability` requires that trusted result whenever artifacts contain
   observed behavior. Missing authority or caller attempts to redefine text,
   expected behavior, priority, or source are blocking gaps.
2. Normalize repository-relative artifact paths, anchors, symbols, behavior
   keys, and ID arrays. Sort before comparison.
3. Classify implementation artifacts:
   - require `observable_behavior` to be an explicit boolean before treating a
     mapped artifact as observable implementation or non-observable support;
     missing or non-boolean classification becomes `mapping_unknown`;
   - explicit non-observable support becomes
     `supporting_implementation`;
   - approved ID or behavior-key mapping becomes
     `requirement_implementation`;
   - unmatched observable behavior becomes `unapproved_behavior`;
   - remaining uncertain work becomes `unmapped_implementation`.
4. Classify verification artifacts:
   - a control ID becomes `control_verification`;
   - an approved requirement mapping becomes `requirement_verification`;
   - an unmatched observable assertion becomes
     `orphan_behavior_assertion`;
   - non-observable harness support becomes `supporting_verification`.
5. Evaluate evidence freshness separately. The existence of a test file does
   not prove it ran or passed for the current contract and relevant paths.
6. Build one row per active or historical requirement ID. Retired requirements
   remain discoverable with a superseded or deferred status and are not
   reassigned.
7. Detect unmatched implementation and test observations, authority conflicts,
   behavior drift, missing mappings, and UAT requirements.
8. Derive row readiness, then the feature verdict. Never accept a stored broad
   status as input to readiness.

An observable artifact cannot be laundered into support merely by declaring a
`supports` field. It must match approved observable behavior or it is
`unapproved_behavior`. Only `requirement_implementation` contributes
`implemented` or `partial` requirement delivery; supporting artifacts alone
leave the requirement implementation `missing` or `unknown`. Likewise,
supporting and control verification do not by themselves pass a requirement
row.

## Independent Status Dimensions

Use separate controlled vocabularies:

| Dimension | Values | Meaning |
|---|---|---|
| Requirement | `draft`, `proposed`, `agreed`, `approved`, `rejected`, `deferred`, `superseded` | approval and normative lifecycle only; only `approved` is approved authority |
| Implementation | `unknown`, `missing`, `partial`, `implemented`, `not_applicable` | observed delivery state only |
| Verification | `unverified`, `passed`, `failed`, `blocked`, `stale`, `not_applicable` | executed verification state only |
| UAT | `not_run`, `in_progress`, `passed`, `failed`, `waived`, `deferred`, `not_applicable` | business acceptance execution only |
| Evidence freshness | `current`, `stale`, `unknown` | binding of evidence to current contract and relevant paths |
| Feature lifecycle | `draft`, `active`, `superseded`, `retired`, `unknown` | feature-level lifecycle, never a test result |
| Readiness | `BLOCKED`, `STALE`, `PARTIAL`, `READY_WITH_WARNINGS`, `READY`, `DEFERRED`, `NOT_APPLICABLE` | deterministic output only |

Never collapse implementation, verification, and UAT into one `done` field.
Automated verification cannot set UAT to `passed`. A lifecycle value such as
`superseded` does not erase historical evidence.

## Gap Taxonomy

Each gap records stable `gap_id`, `type`, affected requirement/artifact IDs,
paths, observed state, expected source reference, `blocking`, required action,
and evidence references.

| Gap type | Default severity | Meaning or required response |
|---|---:|---|
| `missing_approval` | blocking | normative action or waiver/defer lacks explicit approval |
| `missing_requirement_source` | blocking | stable requirement cannot be tied to approved path/hash |
| `missing_implementation` | blocking for required rows | approved required behavior has no implementation or approved non-implementation decision |
| `missing_verification` | partial or blocking by policy | required verification has no acceptable current execution evidence |
| `stale_evidence` | blocking for ready claim | evidence no longer binds current contract, spec, or relevant paths |
| `unknown_evidence_freshness` | partial | required freshness fields are missing |
| `implementation_drift` | blocking | observed code or test behavior contradicts approved expected behavior |
| `conflicting_authority` | blocking | two normative sources disagree for the same identity/revision |
| `untrusted_normative_input` | blocking | behavior comparison lacks the trusted file-backed approved-spec projection |
| `normative_redefinition` | blocking | caller-provided normative fields differ from the approved-spec projection |
| `normative_authority_mismatch` | blocking | an input requirement is absent from the approved-spec projection |
| `unapproved_scope` | blocking | genuine observable implementation has no approved requirement |
| `orphan_behavior_assertion` | warning by default | test asserts behavior without requirement or control ownership |
| `mapping_unknown` | partial | artifact cannot yet be classified as requirement, support, control, or observable scope |
| `identity_collision` | blocking | same active path has different contract identity or a retired ID is reused |
| `active_ledger_ambiguity` | blocking | zero-safe-write discovery found multiple current candidates |
| `legacy_ambiguity` | blocking | legacy record cannot be mapped to exactly one contract |
| `dirty_write_overlap` | blocking until user decision | intended product path overlaps existing user work |
| `uat_failed` | blocking when UAT is required | latest applicable UAT execution failed |
| `uat_decision_unapproved` | blocking | waiver or defer lacks approval-backed decision metadata |
| `redaction_failure` | blocking | secret or PII safety cannot be proven |

Policy may make `missing_verification` blocking, but may not demote authority
conflict, required failure, drift, unapproved scope, identity collision,
required UAT failure, or redaction failure to a ready state.

## Drift And Conflicting Authority

Normalize expected and observed behavior only for comparison; retain exact
source and observation references. Examples of behavior keys include route
availability, permission outcome, workflow transition, validation result,
response/data shape, and business rule outcome.

For each requirement:

1. Resolve approved expected behavior from the immutable source through the
   trusted authority's file-derived requirement projection and source hash.
2. Collect current implementation and test observations with relevant-path and
   evidence hashes.
3. If any current observation contradicts expected behavior, add
   `implementation_drift` with every observed path. Keep the requirement
   unchanged and derive `BLOCKED`.
4. If approved projections disagree with the immutable spec at the recorded
   revision/hash, add `conflicting_authority`; do not choose one silently.
5. If code introduces unmatched observable behavior, add `unapproved_scope`.
   Route a desired change through approved change control; otherwise remove or
   correct the implementation.

Stale observations cannot clear drift. A passing test that codifies the same
wrong behavior is additional drift evidence, not approval.

## Requirement Readiness

Call `deriveRequirementReadiness` or apply the same order exactly:

1. Requirement `deferred` produces `DEFERRED`. Requirement `superseded`
   produces `NOT_APPLICABLE`.
2. A required active requirement that is not `approved` produces `BLOCKED`; an
   optional active requirement that is not `approved` produces `PARTIAL` and
   can never support a ready verdict.
3. Approved implementation and verification both `not_applicable`, with UAT
   also `not_applicable` when required, produces `NOT_APPLICABLE` only when the
   applicable not-applicable decisions carry explicit approval. Each
   implementation or verification decision uses the closed row-bound schema in
   `product-context.md`: its requirement ID and dimension match the row, its
   status is `not_applicable`, its actor, source, reason, and decision ID are
   explicit, and its approval time is a valid ISO-8601 instant. Shape-valid
   decisions remain descriptive until a parent-owned `observeDecisionSet`
   callback returns the exact request-bound observation. Pass the resulting
   opaque one-shot authority through the third `deriveFeatureVerdict` argument
   for the complete row set, or through `deriveRequirementReadiness` options
   for one row. One feature-level capability is consumed once across all bound
   `not_applicable` rows; forgery, replay, or post-observation mutation blocks
   readiness.
4. Required implementation that
   is missing, verification that is failed or blocked, required UAT that
   failed, required UAT marked `not_applicable` without an approved policy
   change, an unapproved UAT waiver/defer, or any blocking gap produces
   `BLOCKED`.
5. Required verification or evidence freshness that is stale produces `STALE`.
6. Unknown or partial implementation, unverified verification, unknown evidence
   freshness, or required UAT that is not run or in progress produces
   `PARTIAL`.
   A passed verification without at least one bound
   `verification_evidence_ids` entry, or required passed UAT without at least
   one bound `uat_record_ids` entry, is also incomplete and cannot produce a
   ready row.
7. An approved UAT waiver/defer, optional failed/blocked verification, optional
   failed UAT, or any non-blocking gap adds a warning. Optional failure can
   never collapse to plain `READY`.
8. No blocker with warnings produces `READY_WITH_WARNINGS`; no blocker or
   warning produces `READY`.

The closed row stores every documented input field, its gaps, and its derived
verdict. Readiness derivation returns blockers and warnings separately. A row
with a missing field, an additional field, or a stored verdict that contradicts
derivation is invalid.

## Feature Verdict

Derive every row first. For an active feature, row IDs must be an exact,
duplicate-free set match for all active requirement IDs, even when the feature
is blocked, stale, or partial. Missing or foreign rows produce `BLOCKED`; they
never collapse to `NOT_APPLICABLE`. An empty row set is `NOT_APPLICABLE` only
when the feature lifecycle is explicitly `superseded` or `retired` and there
are no active requirements to evaluate. Otherwise select the highest-priority
row verdict in this exact order:

```text
BLOCKED
STALE
PARTIAL
READY_WITH_WARNINGS
READY
DEFERRED
NOT_APPLICABLE
```

The feature output includes the selected verdict plus the union of row
blockers and warnings. Do not average, count-majority, or manually promote the
result. Unknown required state cannot yield `READY`.

## Legacy Status Projection

Legacy `done`, `partial`, `missing`, `deferred`, and `n/a` are output-only
compatibility values. They never drive the independent statuses or verdict.

| Derived current state | Legacy projection |
|---|---|
| `READY` | `done` |
| `READY_WITH_WARNINGS` | `done` plus an explicit warning marker |
| `STALE` or `PARTIAL` | `partial` |
| `BLOCKED` with required implementation absent | `missing` |
| Other `BLOCKED` result | `partial` plus blocker references |
| `DEFERRED` | `deferred` |
| `NOT_APPLICABLE` | `n/a` |

Never translate a legacy `done` value back into passed verification, passed
UAT, current evidence, or `READY`. Re-derive from current row-level state.
