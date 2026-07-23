# Product Context Contract

`product_context` is the machine-readable result and handoff for every
`sdcorejs-product` action. It records what authority was used, what could and
did change, how current state was derived, and why the verdict is safe to
consume. Missing values are explicit `null`, `unknown`, or empty collections;
absence never means approved, current, passed, or not applicable.

## Contents

- [Canonical Schema](#canonical-schema)
- [Field Requirements](#field-requirements)
- [Action-Specific Requirements](#action-specific-requirements)
- [Status And Change Rules](#status-and-change-rules)
- [Validation](#validation)
- [Downstream Consumer Rules](#downstream-consumer-rules)
- [Emission And Redaction](#emission-and-redaction)

## Canonical Schema

Use the exact action and stable identity field names consumed by
`_refs/product/product-protocol.mjs`. Collections use deterministic ordering:
paths lexically, IDs naturally then lexically, and evidence by observed time
then stable evidence ID.

```yaml
product_context:
  schema_version: 1
  source: sdcorejs-product
  emitted_at: "{ISO-8601 observed timestamp}"
  source_context_digest: "{sha256 or null for the first context}"
  target:
    repo_root: "{absolute repository root}"
    target_root: "{absolute target root}"
    target_root_kind: "{classified target kind}"
    track: "{product or active delivery track}"
    stack_profile: "{detected profile}"
    current_branch: "{branch or null}"
    current_head: "{Git commit ID or null}"

  product_action: "{one supported action}"
  persistence_requested: "{true only for explicit audit-and-sync persistence intent; otherwise false}"
  write_policy: "{allow or deny}"
  side_effects_allowed: "{boolean from action policy}"
  write_authorized: "{boolean after prerequisites and preflight}"
  requirements_changed: "{boolean}"

  contract_id: "{stable upstream contract ID}"
  feature_id: "{stable feature ID}"
  feature_slug: "{display slug}"
  requirement_revision: "{positive integer}"
  requirement_ids: [AC-001]
  retired_requirement_ids: []
  supersedes: "{prior requirement revision or null}"
  replacement_contract_id: "{stable replacement contract ID or null}"
  change_reason: "{approved reason or null}"
  feature_lifecycle: "{draft, active, superseded, retired, or unknown}"
  approved_spec_path: "{repository-relative immutable spec path}"
  approved_spec_anchor: "{anchor or null}"
  approved_spec_hash: "{sha256}"
  approved_spec_integrity_hash: "{sha256 covering approval metadata and snapshot bytes}"
  approved_plan_path: "{repository-relative immutable approved plan path}"
  approved_plan_hash: "{sha256 of the canonical approved plan body}"
  approved_plan_integrity_hash: "{sha256 covering approved plan approval metadata and snapshot bytes}"
  source_requirement_path: "{repository-relative source path or null}"
  source_requirement_hash: "{sha256 or null}"
  approval:
    approved: "{true, false, or null}"
    approved_by: "{recorded identity or null}"
    approved_at: "{ISO-8601 timestamp or null}"
    approval_source: "explicit-user-choice"

  layout:
    doc_layout: "{existing, fallback, or blocked}"
    contract_key: "{collision-safe key}"
    product_docs:
      root: "{established product root or null}"
      prd_path: "{path or null}"
      stories_path: "{path or null}"
      acceptance_path: "{path or null}"
      uat_path: "{path or null}"
      decisions_path: "{path or null}"
      compact_path: "{path or null}"
    ledger_root: "{path or null}"
    current_path: "{path or null}"
    history_root: "{path or null}"
    uat_root: "{path or null}"
    active_candidates: []
    history_paths: []
    legacy_sources: []
    operations: []
  active_ledger_path: "{same resolved active path or null}"
  conflicting_contract_paths: []

  allowed_paths: []
  prohibited_paths: []
  planned_writes: []
  actual_writes: []
  deleted_paths: []
  dirty_paths: []
  legacy_paths: []
  unrelated_dirty_paths: []
  requires_user_choice: false
  summary_refresh: false
  checkpoint_write: "{boolean}"
  before_status_digest: "{sha256 or null}"
  after_status_digest: "{sha256 or null}"

  normative_before:
    contract_id: "{contract ID}"
    requirement_revision: "{revision}"
    approved_spec_path: "{repository-relative immutable spec path}"
    approved_spec_hash: "{sha256}"
    requirement_ids: [AC-001]
    retired_requirement_ids: []
    requirement_field_hashes:
      AC-001: "{sha256 of the complete normative requirement fields}"
    requirement_source_hashes:
      AC-001: "{sha256 derived from the approved-spec bytes}"
  normative_after:
    contract_id: "{contract ID}"
    requirement_revision: "{revision}"
    approved_spec_path: "{repository-relative immutable spec path}"
    approved_spec_hash: "{sha256}"
    requirement_ids: [AC-001]
    retired_requirement_ids: []
    requirement_field_hashes:
      AC-001: "{sha256 of the complete normative requirement fields}"
    requirement_source_hashes:
      AC-001: "{sha256 derived from the approved-spec bytes}"
  changes:
    normative_change_ids: []
    retired_requirement_ids: []
    descriptive_change_paths: []
    uat_record_ids: []
    ledger_history_created: []
    ignored_unrelated_paths: []

  status:
    feature_lifecycle: "{draft, active, superseded, retired, or unknown}"
    requirement_counts: {}
    implementation_counts: {}
    verification_counts: {}
    uat_counts: {}
    evidence_freshness_counts: {}
  rows:
    - requirement_id: AC-001
      required: true
      source_ref: "{path#anchor}"
      source_hash: "{sha256}"
      requirement_status: "{status}"
      implementation_status: "{status}"
      implementation_approval: "{canonical row-bound not-applicable decision or null}"
      verification_status: "{status}"
      verification_approval: "{canonical row-bound not-applicable decision or null}"
      uat_status: "{status}"
      uat_required: "{boolean}"
      uat_approval: "{approval-backed waiver, defer, or not-applicable decision or null}"
      evidence_freshness: "{current, stale, or unknown}"
      implementation_refs: []
      verification_evidence_ids: []
      uat_record_ids: []
      gaps: []
      verdict: "{derived row verdict}"
  readiness_policy:
    uat_required: "{boolean}"

  evidence: []
  evidence_current: "{selected evidence record or null}"
  evidence_freshness: "{current, stale, or unknown}"
  uat_result:
    uat_record_id: "{stable execution ID or null}"
    scenario_id: "{stable scenario ID or null}"
    contract_id: "{stable contract ID or null}"
    requirement_revision: "{positive integer or null}"
    requirement_ids: []
    scenario_source_ref: "{approved scenario path#anchor or null}"
    scenario_source_hash: "{sha256 or null}"
    preconditions: []
    actor_role: "{business role or null}"
    test_data_ref: "{sanitized fixture or dataset reference or null}"
    environment:
      environment_name: "{non-secret label or null}"
      build_or_revision: "{deployed revision identifier or null}"
      environment_fingerprint: "{sha256 or null}"
    steps_ref: "{approved scenario path#steps-anchor or null}"
    expected_result: "{approved expected-result projection or null}"
    expected_result_ref: "{approved scenario path#expected-result-anchor or null}"
    execution_kind: manual
    executed_by: "{recorded executor identity or null}"
    executed_at: "{ISO-8601 timestamp or null}"
    actual_result: "{observed result or null}"
    status: "{in_progress, passed, failed, waived, or deferred}"
    evidence_refs: []
    recorded_by: "{agent or system identity or null}"
    recorded_at: "{ISO-8601 timestamp or null}"
    decision: "{complete waiver/deferral decision or null}"
    redaction: "{redaction object or null}"
  uat_records: []
  gaps: []
  verdict: "{BLOCKED, STALE, PARTIAL, READY_WITH_WARNINGS, READY, DEFERRED, or NOT_APPLICABLE}"
  blockers: []
  warnings: []

  redaction:
    redaction_applied: "{boolean}"
    redacted_fields: []
    excluded_paths: []
    secret_scan: "{passed, failed, unavailable, or not_applicable}"
    pii_redacted: "{boolean}"
    logs_sanitized: "{boolean}"
  validation:
    action_errors: []
    identity_errors: []
    side_effect_errors: []
    context_errors: []
    validator_module: _refs/product/product-protocol.mjs
```

The persisted context stores normative references and per-field hashes rather
than full requirement prose. Callers may pass richer in-memory before/after
objects to validators, but must redact them and must not duplicate them in the
ledger.

The traceability-row schema is closed: every field shown above is required and
no additional field is accepted. `source_ref` uses canonical
`<repository-path>#<anchor>` form, `source_hash` is SHA-256, the two `required`
fields are booleans, and `verdict` is always the derived row verdict. Approval
fields remain present but `null` when their dimension does not need an
exception; null is valid and does not imply approval.

When implementation or verification is `not_applicable`, its approval field is
the following closed decision object. No generic or differently scoped approval
can satisfy row readiness:

```yaml
decision_id: "{stable decision ID}"
requirement_id: AC-001
dimension: "{implementation or verification}"
status: not_applicable
approved: true
approved_by: "{actor identity}"
approved_at: "{ISO-8601 instant}"
approval_source: "{explicit approval source}"
reason: "{bounded reason}"
```

The `requirement_id` and `dimension` must match the containing row. Every text
field is non-empty, `approved_at` is a valid instant, and unknown fields are
rejected. `implementation_approval` is `null` unless
`implementation_status: not_applicable`; the equivalent rule applies to
verification. UAT decisions continue to use the separate closed UAT decision
contract.

## Field Requirements

Every context requires:

- `schema_version`, `source`, `emitted_at`, target identity, and exactly one valid
  `product_action`;
- `write_policy`, `side_effects_allowed`, `write_authorized`,
  `requirements_changed`, and all
  planned/actual/deleted path arrays;
- `contract_id`, `feature_id`, positive `requirement_revision`, requirement ID
  collections, approved spec path/body/integrity hashes, and approved plan
  path/body/integrity hashes;
- a `layout.doc_layout` result, explicit active-ledger result, history and legacy
  discovery collections, and collision collection;
- normative before/after identity and hashes, even for read-only execution;
- independent `status`, `rows`, `evidence`, `uat_records`, `gaps`, verdict,
  blockers, warnings, and redaction records;
- validation result arrays, including empty arrays when checks pass.

Normative actions require complete approval metadata even while their verdict
is blocked and no write has occurred. `approved: true` without approver,
timestamp, and approval source is not authority.
Only an approved snapshot whose `approval_source` is
`explicit-user-choice` can authorize execution. Imported snapshots and
equivalent complete inputs remain unapproved until the user explicitly accepts
the exact immutable snapshot and a new authority/integrity hash is recorded.

Complete metadata is still self-attested until the file-backed authority
preflight succeeds. A ready verdict, `write_authorized: true`, or an observed
persisted write requires the module-issued `trusted_authority` result from
`verifyApprovedSpecAuthority`. That result binds the actual immutable snapshot
body hash and authority/integrity hash to this context's repository root, spec
path, contract, feature, revision, complete requirement ID set, and approval
metadata. It also carries the file-derived `requirements`,
`requirement_field_hashes`, and `requirement_source_hashes`; behavior comparison
and both normative snapshots use that complete projection and both hash maps
instead of caller-provided prose or expectations.
Raw synchronous context validation is pre-validation only and fails
closed for readiness or writes without a private one-shot final authorization.
Immediately before publishing a ready verdict or authorizing a write, call
`authorizeProductContext`; after all parent-observer waits, it re-reads and
re-hashes all relevant current-state files, the approved spec, and the exact
approved plan. It validates the plan and approved-spec chain with the shared
approved-plan integrity contract, binds the plan's contract, feature, revision,
complete requirement ID set, product action, and target root to the context,
validates the complete context, and consumes its private authorization
capability. For a planned pre-write context with no observed writes, the parent
must supply bounded `executeWrite` and `observeWriteResult` callbacks. The gate
invokes the writer with `{ repository_root, context_digest,
current_state_digest, planned_writes, request_digest }`, requires a closed
receipt with exact request/context digests, actual/deleted paths, and an SHA-256
after-status digest, then compares it with the parent-observed post-write result
bound to the receipt digest. A no-op, mismatch, or path outside the planned set
fails closed. Only then does the gate return `authorized: true` and
`write_executed: true`; these are completed-execution evidence, not permission
for another write. Post-write authorization is a fresh validation-only call.
Earlier WeakSet-backed tokens cannot be reused as final authority.

Approved-plan identity is supplied by the validated execution handoff. The
context and every product-consumable test-evidence record carry the same
`approved_plan_path`, canonical body hash, and authority/integrity hash. Product
freshness compares that identity exactly. Final authorization independently
observes those values from the approved-plan file and treats caller-supplied
values only as comparisons; it does not allow a caller to replace the plan with
a new local claim.

The file-observed approved-plan scope is also authoritative. Context
`allowed_paths` may be empty or narrower than the plan's `allowed_paths`, but it
must never widen them or intersect the plan's `prohibited_paths`. Every concrete
`planned_writes`, `actual_writes`, and `deleted_paths` entry must be allowed by
both boundaries and excluded by both prohibition sets. Scope comparison uses
the shared approved-plan canonical repository-relative path, supported glob,
target-root, and platform case rules. `audit-readonly` keeps an empty context
allowlist and all three persisted-path arrays empty. A product plan includes
`product/**` and `.sdcorejs/docs/product/**` as separate entries only when the
approved work authorizes both normative product documents and derived ledgers.

Final authorization also uses `observeProductLayoutState` to enumerate and hash
every matching `.sdcorejs/docs/product/**/current.md` file for the contract and
feature. The resulting opaque trusted layout must exactly match
`layout.active_candidates`; caller omission cannot hide an active-ledger
collision. For `audit-readonly`, parent-owned `observeAuditStatus` and
`executeAudit` callbacks feed `observeAuditReadonlyState`. It runs
`observeStatus(before) -> executeAudit -> observeStatus(after)`; the executor
must return `{ completed: true, request_digest }` with the exact request digest.
The request-bound before/after SHA-256 status observations must then match, and
the opaque proof is consumed once even when the audit verdict is blocked or
otherwise non-ready. Missing or out-of-bracket execution fails closed.

Do not omit empty or false fields. A consumer must be able to distinguish an
observed empty collection from an unobserved field.

The top-level context and its `target`, `approval`, `layout`,
`layout.product_docs`, `changes`, `status`, `readiness_policy`, `redaction`,
and `validation` objects are closed schemas. Unknown fields are validation
errors rather than extension points. Normative snapshots, gap objects, evidence
records, and UAT records are also closed at their documented boundaries.
Secret and PII scanning covers every reportable payload, including blockers,
warnings, gaps, and normative snapshots; nesting data under a non-evidence
field does not bypass redaction.

Both normative snapshots bind contract ID, revision, immutable spec path/hash,
active requirement IDs, retired requirement IDs, requirement-field hashes, and
the authority-derived `requirement_source_hashes`. Derived actions bind both
snapshots to the top-level identity and require them to be identical. Revision
actions bind `normative_before` to `supersedes`, bind `normative_after` to the
new top-level identity, validate retired-ID history, and require a new immutable
approved spec path and hash.

The action boundary is emitted before reads. The final `product_context` is
emitted after discovery, evidence derivation, redaction, and validation. Its
`product_action` and maximum side-effect policy must match the earlier boundary.

## Action-Specific Requirements

| Action | Additional required fields and invariants |
|---|---|
| `seed-from-approved-spec` | Stable contract ID, revision 1, non-empty stable requirement IDs, approved immutable spec path/hash, approval, no conflicting prior projection, existing-or-fallback layout, `requirements_changed: true` |
| `requirements-update` | Prior context digest, next revision exactly one higher, `supersedes`, change reason, approved change control, new approved spec path/hash, retired-ID history, `requirements_changed: true` |
| `traceability-sync` | Exact contract ID, positive revision, approved spec path/hash, explicit evidence array, complete identical normative before/after snapshots, `requirements_changed: false`, writes limited to resolved derived ledger/index/history ownership |
| `audit-readonly` | Exact contract ID, positive revision, approved spec path/hash, explicit evidence array, complete identical normative snapshots, `side_effects_allowed: false`, `write_authorized: false`, empty allowed/planned/actual/deleted paths, no checkpoint, no summary refresh, and a request-bound one-shot zero-write proof obtained through parent-owned `observeAuditStatus` and `executeAudit` callbacks |
| `audit-and-sync` | Every audit input, explicit `persistence_requested: true`, complete identical normative snapshots, and `requirements_changed: false`; a final context with writes also requires post-preflight `write_authorized: true` and an explicit derived write allowlist |
| `record-uat` | Exact contract ID, positive revision, approved spec hash, complete identical normative snapshots, `requirements_changed: false`, and the full closed UAT record: active requirement IDs, scenario/source identity, preconditions, role, sanitized data, environment/build identity, steps and expected-result refs, expected and actual results, evidence refs, `execution_kind: manual`, executor/recorder times, decision, and redaction; `waived` or `deferred` also requires the complete matching decision record |
| `supersede-feature` | Stable contract ID, incremented revision, `supersedes`, approval, change reason, approved spec path/hash, superseded feature lifecycle, replacement contract ID or approved no-replacement decision |

If an action prerequisite is missing, keep the selected action, emit
`write_authorized: false`, leave authorized paths empty, record validator
errors, and derive a non-ready verdict. Do not reinterpret the request.
`write_policy` is `deny` for `audit-readonly` and `allow` for the six
write-capable actions; it never overrides `write_authorized: false`.

## Status And Change Rules

Requirement, implementation, verification, UAT, evidence freshness, feature
lifecycle, and readiness are separate dimensions. A status in one dimension
never overwrites another. `rows` are the source for deterministic row and
feature verdict derivation; aggregate counts in `status` are projections only.
Rows use only the canonical flat status fields shown in the schema. A nested
`statuses` alias, even when its values happen to match, is rejected rather than
allowed to override the evidence and UAT fields inspected by consumers.
Top-level `feature_lifecycle` is the validator-facing value and must equal
`status.feature_lifecycle`.

A UAT-dependent row can support `READY` or `READY_WITH_WARNINGS` only when it
binds the latest valid manual execution for that requirement. The execution's
`scenario_source_hash` must match the current approved scenario source hash,
and `environment.build_or_revision` must match the current build or deployed
revision under assessment. Missing or mismatched bindings cannot support a
ready verdict. For `waived` or `deferred`, `uat_approval` is only a row
projection: the complete matching decision record must remain in the bound UAT
record and cannot be replaced by a boolean or reference.

Every active context contains exactly one row for every active
`requirement_id`, no rows for retired or foreign IDs, and no duplicate row IDs,
including blocked, stale, and partial contexts. Missing rows cannot produce
`NOT_APPLICABLE`; an empty row set is valid only for an explicitly superseded or
retired feature with no active requirements. The latest UAT execution is
selected by parsed ISO-8601 instants rather than lexical timestamp ordering;
invalid instants are validation errors.

`evidence_current` is validated as a complete evidence record, must exactly
match the selected record in `evidence`, and participates in the same secret and
PII scan. Evidence and UAT records are closed at their declared schema
boundaries; documented test-evidence compatibility aliases remain allowed only
when they agree with their canonical fields.

For passed requirement evidence, `relevant_paths` is non-empty, its normalized
set exactly matches the keys in `relevant_path_hashes`, each value is SHA-256,
and `relevant_paths_hash` is the canonical aggregate. Each row-bound record
also includes the row's approved-spec source, every implementation ref, every
recorded test/artifact path, and its expected-result spec ref in that exact
manifest. Evidence identity carries and matches `contract_id`, `feature_id`,
revision, approved spec path/body/integrity identity, and approved plan
path/body/integrity identity.
A passed verification status requires at least one bound
`verification_evidence_ids` entry. Required passed UAT requires at least one
bound `uat_record_ids` entry. Empty IDs are partial or blocked state, never a
ready row. Evidence timestamps must be valid ISO-8601 instants in causal order;
output, environment, relevant-path, and diff digests must be SHA-256; changed
paths must be safe repository-relative paths; and command outcome must agree
with its exit code. Malformed or unresolved records cannot contribute a passed
dimension.
A ready context,
`write_authorized: true`, or a context reporting planned, actual, or deleted
persisted writes also consumes the trusted file-backed current-state token
emitted by the protocol's filesystem observer. A non-ready verdict does not
bypass this requirement, and raw caller-supplied path hashes cannot authorize
readiness or writes.

When current UAT contributes to readiness, the same opaque observation hashes
each canonical `scenario_source_ref` file and obtains the current build or
deployed revision from a parent-owned asynchronous observer callback. Raw
`uat_scenario_hashes` and `uat_build_or_revision` values remain comparison
claims only; matching caller-authored strings cannot establish UAT freshness.
The observer rejects a symbolic link or junction at any syntactic path segment,
including an ancestor whose target remains inside the repository.
Waiver and deferral decisions bind the exact scenario and requirement scope,
remain unexpired and not review-due at `emitted_at`, and match the row projection
over their complete canonical identity.

Ready authorization also requires parent-owned automated-evidence and manual-UAT
execution observers for the exact IDs bound by ready rows. Their closed
projections are compared to the raw records and bound into an opaque in-process
one-shot attestation. This is a host trust boundary, not cryptographic proof: a
malicious host can lie, so callbacks must read the actual runner/report/UAT
system and must not echo the untrusted context being validated. Complete every
observer wait before the final relevant-file, approved-spec, and approved-plan
re-reads. Do not perform another external observer wait before the one-shot
decision.

`changes.normative_change_ids` is non-empty only for an approved normative
action. Derived actions must have equal deterministic `normative_before` and
`normative_after` values. `record-uat` lists new execution IDs under
`changes.uat_record_ids`; it never lists a requirement change.

`actual_writes` is obtained from post-action Git and filesystem evidence, not
from the plan or agent report. Renames are represented as source deletion plus
destination addition. Unrelated dirty paths remain separate and are never
reported as product writes.

Any write after context emission stales its associated status, evidence, and
verdict. A downstream writer creates a new context; it does not edit the prior
context in place.

## Validation

Apply the file-backed verifier and deterministic functions from
`_refs/product/product-protocol.mjs`:

1. `verifyApprovedSpecAuthority` reads the repository-relative immutable
   snapshot, recomputes both the canonical approved-body SHA-256 and the
   authority/integrity SHA-256 covering approval metadata, validates constrained
   approved frontmatter, derives canonical `requirements`,
   `requirement_field_hashes`, and `requirement_source_hashes`, and returns the
   in-process `trusted_authority` result.
2. `authorizeProductContext` is the mandatory asynchronous final gate for a
   ready verdict or write. After every execution and build observer completes,
   it freshly reads the relevant paths, approved spec, and exact approved plan,
   validates the plan integrity, approved-spec chain, and the context's
   allowlist plus planned/actual/deleted paths against the file-observed plan
   scope, and consumes a one-shot private authorization capability. A planned
   pre-write context with no observed writes also requires parent-owned
   `executeWrite` and `observeWriteResult` callbacks. The gate invokes the
   writer exactly once inside the authorization boundary and accepts completion
   only after its request-bound receipt matches the observed post-write paths
   and status digest. For
   contexts carrying UAT, the
   parent must also supply the build-identity observer used by the gate; the
   gate hashes scenario source files itself. For ready rows, the parent also
   supplies automated-evidence and manual-UAT execution observers; raw records
   alone cannot authorize readiness. Final plan path/body/integrity values come
   from the file observation rather than the caller's context. The same gate
   obtains trusted active-ledger state through `observeProductLayoutState`;
   `audit-readonly` also requires parent-owned `observeAuditStatus` and
   `executeAudit` callbacks and consumes the opaque proof from
   `observeAuditReadonlyState` only after the exact audit is bracketed.
3. `validateProductAction` checks action policy and action prerequisites.
4. `validateIdentityTransition` checks approved revisions, retired IDs, and
   stable contract identity when an earlier state exists.
5. `observeProductLayoutState` enumerates file-backed active candidates;
   `resolveProductLayout` produces the collision-safe fallback only after that
   established-layout discovery.
6. `validateActionSideEffects` checks zero-write, allowlists, normative
   immutability, dirty overlap, and legacy preservation before and after writes.
7. `evaluateEvidenceFreshness`, `deriveTraceability`,
   `deriveRequirementReadiness`, and `deriveFeatureVerdict` derive state.
8. `redactProductEvidence` runs before a context is persisted or displayed.
9. `validateProductContext` consumes the trusted authority and current-state
   results for synchronous pre-validation and rejects action, path, authority,
   verdict, freshness, collision, and redaction contradictions. For a ready
   verdict or write, its private one-shot final authorization is supplied only
   internally by `authorizeProductContext`; callers cannot mint, retain, or
   reuse that capability.
10. `validateProductOrchestration` is also required when the context is part of
   a declared lifecycle DAG. Use `{ validationPhase: 'preflight' }` before
   dispatch to validate topology, order, ownership, and write policy without
   inventing run results. Use the default completed phase after execution to
   require PASS/output evidence, post-sync identity, and audit status proof.

Store returned errors verbatim in the corresponding validation arrays. A
non-empty error array prevents `write_authorized: true` for a not-yet-executed
write and prevents a ready claim after execution.

## Downstream Consumer Rules

- `sdcorejs-spec` creates stable contract and requirement identity. Product
  execution consumes it and never mutates the snapshot.
- `sdcorejs-plan` binds an exact contract ID, revision, spec path, and hash.
  Plan prose cannot redefine the requirements.
- `sdcorejs-execute-plan` preserves `product_action` and the input context
  digest. It does not replace an explicit product action with a broad track
  label.
- Implementation and design executors consume normative references and emit
  changed paths. They cannot update the product context's normative fields.
- `sdcorejs-test` emits evidence records tied to contract, feature, revision,
  spec body and integrity hashes, relevant paths, HEAD/diff, and output digest.
  Automated E2E leaves UAT status unchanged.
- `sdcorejs-parallel-dispatch` freezes the context digest. Integration owns
  `traceability-sync` only after implementation and test fan-in.
- Final product audit produces a fresh `audit-readonly` context with zero
  writes. `sdcorejs-ship` consumes it when the delivery has a relevant product
  contract, but does not require a product context for unrelated specless or
  documentation-only work.
- No downstream consumer may change `product_action`, contract identity,
  verdict, freshness, or gaps in place. It derives and validates a successor
  context with `source_context_digest`.

## Emission And Redaction

Emit the YAML block before the localized prose summary so machines can parse it
without interpreting narrative text. Use repository-relative paths and stable
IDs. Preserve the user's language in human-facing summaries and projected
product prose; keep schema keys and identifiers in English.

Run redaction before hashing displayed output, persisting evidence, or emitting
the context. Replace secret and PII values with `[REDACTED]`, record the affected
field paths, and digest only the sanitized bounded output. If redaction cannot
be proven, set the relevant validation error and use a non-ready verdict.
