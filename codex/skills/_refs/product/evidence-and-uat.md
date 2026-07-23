# Product Evidence And UAT

Evidence proves what was actually observed for one contract state. UAT records
business acceptance against an approved scenario. Both are descriptive,
redacted, revision-bound records; neither may rewrite normative requirements.

## Contents

- [Evidence Record](#evidence-record)
- [Evidence Acceptance](#evidence-acceptance)
- [Relevant-Path Identity](#relevant-path-identity)
- [Freshness](#freshness)
- [Parent-Observed Execution Attestations](#parent-observed-execution-attestations)
- [Unrelated HEAD Movement](#unrelated-head-movement)
- [UAT Record](#uat-record)
- [Automated E2E Separation](#automated-e2e-separation)
- [Waiver And Deferral](#waiver-and-deferral)
- [Record-UAT Action](#record-uat-action)
- [Redaction](#redaction)

## Evidence Record

Persist only evidence from an actual observation. A planned command, test file,
old report, or agent intention is not executed evidence.

```yaml
product_evidence:
  evidence_id: "{stable evidence ID}"
  kind: "{unit, integration, e2e, security, regression, manual-check, runtime, review, or uat}"
  requirement_ids: [AC-001]
  control_requirement_ids: []

  command: "{actual command or null for a non-command observation}"
  cwd: "{actual repository-relative or absolute execution cwd}"
  started_at: "{ISO-8601 timestamp or null}"
  finished_at: "{ISO-8601 timestamp or null}"
  observed_at: "{ISO-8601 timestamp}"
  observed_by: "{executor, observer, or source identity}"
  observation_source: "{command, report, tool, message, or UAT record reference}"
  exit_code: "{integer or null}"
  outcome: "{passed, failed, blocked, or observed}"
  observed_result: "{bounded factual result}"
  expected_result_ref: "{approved source path#anchor or control reference}"

  environment:
    environment_name: "{local, test, preview, or other non-secret label}"
    runtime_versions: {}
    platform: "{platform identifier}"
    locale: "{runtime locale or null}"
    timezone: "{timezone or null}"
    environment_fingerprint: "{sha256 of sanitized material fields}"

  verified_head: "{Git commit ID}"
  associated_diff:
    base_head: "{Git commit ID}"
    head: "{Git commit ID or null for dirty-tree evidence}"
    diff_hash: "{sha256 of canonical relevant diff}"
    changed_paths: []

  contract_id: "{stable upstream contract ID}"
  feature_id: "{stable feature ID}"
  requirement_revision: "{positive integer}"
  approved_spec_path: "{immutable spec path}"
  approved_spec_hash: "{sha256}"
  approved_spec_integrity_hash: "{sha256 covering snapshot authority and approval metadata}"
  approved_plan_path: "{immutable approved plan path}"
  approved_plan_hash: "{sha256 of the canonical approved plan body}"
  approved_plan_integrity_hash: "{sha256 covering approved plan authority and snapshot bytes}"
  relevant_paths: []
  relevant_path_hashes: {}
  relevant_paths_hash: "{sha256}"

  output_digest: "{sha256 of sanitized bounded output}"
  artifacts:
    - artifact_id: "{stable artifact ID}"
      path: "{repository-relative path or external evidence reference}"
      anchor: "{symbol, line, test name, or null}"
      content_hash: "{sha256 or null}"

  redaction:
    redaction_applied: "{boolean}"
    redacted_fields: []
    excluded_paths: []
    secret_scan: "{passed, failed, unavailable, or not_applicable}"
    pii_redacted: "{boolean}"
    logs_sanitized: "{boolean}"

  freshness:
    value: "{current, stale, or unknown}"
    reasons: []
    evaluated_at: "{ISO-8601 timestamp}"
    head_changed: "{boolean}"
```

Use `command: null` and `exit_code: null` only when the evidence kind does not
run a command, such as a supplied UAT observation or approved external report.
In that case, `observed_result`, executor/source identity, artifacts, time,
environment, contract identity, hashes, and redaction remain required.

## Evidence Acceptance

Evidence is acceptable only when:

- the command and cwd are the actual values used, and the exit code is
  recorded rather than inferred;
- `started_at`, `finished_at`, `observed_at`, and freshness time values are
  valid ISO-8601 instants in causal order; no completion or evaluation time may
  precede the observation it describes;
- the controlled `outcome` agrees with the exit code, assertions, observed
  result, and expected artifacts; an exit code alone is not a pass;
- the sanitized environment fingerprint, output digest, relevant-path hashes,
  relevant-path aggregate, and associated diff hash are SHA-256 values;
- HEAD or exact dirty-diff identity binds the result to repository state;
- contract ID, feature ID, requirement revision, approved spec path/body hash,
  approved spec integrity hash, and relevant-path hashes bind the result to
  product state;
- the bounded observed result and output digest agree with the recorded exit
  and artifact state;
- every associated changed path is a normalized safe repository-relative path;
  absolute, drive-relative, traversal, linked escape, and malformed paths fail
  closed;
- expected artifacts were inspected or their absence is recorded;
- redaction completed before persistence and digesting displayed output;
- freshness is deterministically evaluated against current state.

Evidence and UAT execution records are closed schemas. Unknown fields fail
validation. The compatibility aliases documented in
`_refs/shared/test-context.md` are the only optional evidence extensions and
must equal their canonical nested values. A selected `evidence_current` record
must be byte-equivalent under deterministic serialization to the record with
the same ID in the evidence collection and is redacted and scanned again.

Exit code 0 alone is not a pass. A failing assertion, missing artifact, wrong
cwd, truncated critical output, stale contract, or redaction failure remains a
failure or blocker. A test plan or unexecuted command remains `unverified`.

## Relevant-Path Identity

`relevant_paths` is the minimal complete set whose content can affect the
verified behavior. Include implementation, configuration, schemas, migrations
when in scope, tests, fixtures, generated inputs, and approved contract sources
needed to interpret the result. Exclude unrelated documentation only when it
cannot change the behavior or verification.

Build `relevant_paths_hash` deterministically:

1. Normalize each path to a repository-relative slash form and reject path
   escape.
2. Sort unique paths lexically using target filesystem case rules.
3. Hash each existing file's exact bytes. Represent a relevant deletion or
   missing expected file with an explicit stable marker.
4. Canonically serialize path plus content-hash pairs.
5. Hash the serialization with SHA-256.

Store both the path list, individual hashes, and aggregate hash so a consumer
can explain staleness. Relevant uncommitted changes are also represented by the
canonical diff hash and current file hashes.

The normalized key set in `relevant_path_hashes` must exactly equal
`relevant_paths`; every per-path value and `relevant_paths_hash` must be a
lowercase or uppercase hexadecimal SHA-256 digest. Passed evidence bound to one
or more requirements must have at least one behavior-relevant path. Empty or
caller-invented matching aggregates are invalid. The parent preflight calls the
file-backed current-state observer from `_refs/product/product-protocol.mjs` to
hash the current bytes; a caller-supplied hash map is not trusted for readiness.

For every passed row-bound evidence record, its manifest must contain the exact
approved-spec file referenced by the row and `expected_result_ref`, every row
`implementation_ref`, and every repository artifact path recorded by that
evidence. A manifest that hashes only an unrelated file cannot support the row,
even when its aggregate is internally valid and current.

## Freshness

Call `evaluateEvidenceFreshness` with the evidence identity and current state.
Required comparison fields are:

- `contract_id`;
- `feature_id`;
- `requirement_revision`;
- `approved_spec_path`;
- `approved_spec_hash`;
- `approved_spec_integrity_hash`;
- `approved_plan_path`;
- `approved_plan_hash`;
- `approved_plan_integrity_hash`;
- `relevant_paths_hash`.
- `verified_head` as provenance, subject to the unrelated-HEAD rule below.

| Result | Condition | Readiness effect |
|---|---|---|
| `current` | all identity, approved-spec authority, approved-plan authority, path, and provenance fields exist and match | may support readiness when all other evidence rules pass |
| `stale` | contract, feature, revision, spec identity, plan identity, or relevant-path hash differs | cannot support `READY`; required stale evidence yields `STALE` unless a stronger blocker exists |
| `unknown` | a required field is missing on either side | cannot support `READY`; required unknown evidence yields `PARTIAL` unless blocked |

Record every mismatch reason. Do not refresh an old evidence record in place;
create a new execution record. A later write to any relevant path stales the
prior result. A later write outside the relevant set is evaluated under the
unrelated-HEAD rule rather than assumed stale.

## Parent-Observed Execution Attestations

Raw automated evidence and raw manual UAT records are comparison claims. A
`READY` or `READY_WITH_WARNINGS` decision calls `authorizeProductContext` with
parent-owned `observeAutomatedEvidence` and `observeManualUat` callbacks for the
exact IDs bound by ready rows. The returned closed projections must exactly
match the recorded command/result/output/path identity and the recorded manual
executor/time/result/decision/build identity. Automated projections cover the
evidence ID, command, cwd, start/finish/observation times, exit code, outcome,
observed result, output digest, verified HEAD, diff identity, relevant-path
identity, environment fingerprint, and artifact paths. Manual projections cover
the complete acceptance-relevant UAT record: scenario and requirement binding,
source hash, preconditions, role, data ref, environment/build, steps and
expected-result refs, expected/actual result, status, evidence refs,
executor/recorder identities and times, decision, and redaction. The protocol
binds those observations into an opaque, in-process, one-shot attestation; copied or
caller-authored objects are not accepted.

These callbacks are a host trust boundary, not cryptographic proof that a test
or human action occurred. A malicious or compromised host can lie. The parent
must source them from the actual command runner, test-report collector, or
authorized UAT capture system and must not implement them by echoing the
untrusted `product_context` record under validation.

## Unrelated HEAD Movement

HEAD is required provenance, but HEAD inequality alone does not make scoped
evidence stale. If `verified_head` differs while contract ID, revision, approved
spec hash, and relevant-path hash still match, freshness remains `current` and
`head_changed: true` is recorded. The matching relevant-path hash is the
mechanical binding; record the current changed-path set when available to make
the unrelated movement explainable.

If any relevant path or approved contract source changed, or path relevance
cannot be determined, the exception does not apply. Use `stale` for a proven
change and `unknown` for missing proof. A documentation-only HEAD movement is
not automatically unrelated when that document is itself the approved source
or a verification input.

## UAT Record

UAT execution uses a stable record separate from the approved scenario
definition:

```yaml
uat_record:
  uat_record_id: UAT-001-EXEC-001
  scenario_id: UAT-001
  contract_id: "{stable upstream contract ID}"
  requirement_revision: "{positive integer}"
  requirement_ids: [AC-001]
  scenario_source_ref: "{approved UAT path#anchor}"
  scenario_source_hash: "{sha256}"

  preconditions: []
  actor_role: "{business role}"
  test_data_ref: "{sanitized fixture or dataset reference}"
  environment:
    environment_name: "{non-secret environment label}"
    build_or_revision: "{deployed revision identifier}"
    environment_fingerprint: "{sha256}"
  steps_ref: "{approved scenario path#steps-anchor}"
  expected_result: "{approved expected-result projection}"
  expected_result_ref: "{approved scenario path#expected-result-anchor}"
  actual_result: "{observed business result}"
  status: "{in_progress, passed, failed, waived, or deferred}"
  evidence_refs: []

  execution_kind: manual
  executed_by: "{recorded person or authorized business tester identity}"
  executed_at: "{ISO-8601 timestamp}"
  recorded_by: "{agent or system identity}"
  recorded_at: "{ISO-8601 timestamp}"
  decision: "{waiver or deferral decision object, otherwise null}"
  redaction:
    redaction_applied: "{boolean}"
    redacted_fields: []
    pii_redacted: "{boolean}"
    logs_sanitized: "{boolean}"
```

The stable `scenario_id` identifies the approved scenario. Every execution gets
a new `uat_record_id`; never overwrite an earlier execution. Preconditions,
role, data reference, environment, expected result, actual result, evidence,
executor, and execution time are required for passed or failed UAT. Test data
references sanitized fixtures; do not persist customer data.

Readiness must bind each UAT-dependent row to the latest valid manual execution
for that requirement, and every `requirement_ids` entry must belong to the
active contract. The scenario ID and source/hash must resolve to the approved
scenario; `steps_ref` and `expected_result_ref` must be anchors within that
source; the recorded steps and expected result must match the approved scenario;
and every `evidence_refs` ID must resolve to accepted evidence in the same
context. The execution's `scenario_source_hash` must match the current approved
scenario source hash, and `environment.build_or_revision` must match the current
build or deployed revision under assessment. A missing, foreign, unresolved, or
mismatched binding cannot support `READY` or `READY_WITH_WARNINGS`.
`executed_at` and `recorded_at` are valid ISO-8601 instants, recording cannot
precede execution, and latest-result selection compares parsed instants rather
than timestamp text.

## Automated E2E Separation

Automated E2E is `verification_status`, never UAT status. An E2E pass may be
linked as evidence to a UAT record, but it cannot create the record, supply the
business executor, or set UAT to `passed`. Likewise, an E2E failure does not
invent a UAT execution; it blocks or fails verification independently.

Only an explicit result from the authorized PO, QC, business tester, or other
approved acceptance role can set UAT to passed or failed. Tool-assisted capture
is acceptable when the human/business executor and actual observation remain
recorded.

## Waiver And Deferral

`waived` and `deferred` are not passed. Each requires:

```yaml
uat_decision:
  decision_id: "{stable decision ID}"
  status: "{waived or deferred}"
  reason: "{approved reason}"
  scope:
    scenario_ids:
      - "{exact scenario ID}"
    requirement_ids:
      - "{exact requirement ID}"
  approved: true
  approved_by: "{recorded approver identity}"
  approved_at: "{ISO-8601 timestamp}"
  approval_source: "{decision path or message reference}"
  expires_at: "{ISO-8601 timestamp or null}"
  review_at: "{ISO-8601 timestamp or null}"
```

Missing approval produces `uat_decision_unapproved` and `BLOCKED`. An approved
waiver/defer may support `READY_WITH_WARNINGS` when no other blocker, stale
state, or partial state remains. It never changes the UAT status to passed.
Every waived or deferred execution must embed the complete `uat_decision`
record above as `decision`; a status, approval flag, or external reference alone
is insufficient.

The scope arrays must exactly match the bound UAT record's scenario and
requirement IDs. `approved_at`, non-null `expires_at`, and non-null `review_at`
must be valid ISO-8601 instants; an expired decision or a decision whose review
time is due cannot support readiness. The row-level `uat_approval` must match
the complete embedded decision identity, including decision ID, status, scope,
approval provenance, expiry, and review time.

## Record-UAT Action

`record-uat` requires an explicit `uat_result` before any write:

1. Resolve the exact contract, revision, scenario ID, source reference, source
   hash, and current build or deployed revision.
2. Reject a missing `execution_kind: manual`, executor, observed time, actual
   result, environment, stable execution ID, or redaction state.
3. Verify the scenario ID, source/hash, active requirement IDs, `steps_ref`,
   `expected_result_ref`, steps, and expected result match the approved
   scenario, and resolve every evidence ref to accepted evidence in the same
   context. A desired scenario change routes to approved
   `requirements-update` instead.
4. Require the complete approved decision record for `waived` or `deferred`,
   then redact and create a new immutable execution record. Do not edit an
   earlier result.
5. Write only derived UAT indexes/status references in the active ledger and
   create history according to the resolved layout.
6. Derive UAT and feature readiness independently and emit a validated
   `product_context` with `requirements_changed: false`.

If the supplied result is ambiguous or lacks approval for waiver/defer, record
no UAT write and report the missing fields.

## Redaction

Redact before persistence, output, hashing bounded logs, or sending evidence to
another agent. At minimum protect:

- authorization headers, cookies, session IDs, access/refresh tokens, API keys,
  passwords, secrets, private keys, connection strings, and environment values;
- email addresses, phone numbers, physical addresses, government identifiers,
  customer/account identifiers, and unnecessary names;
- customer payloads, production records, screenshots, and logs containing any
  of the above.

Use `[REDACTED]` in place of values and record redacted field paths. Prefer
synthetic fixtures and bounded excerpts. Do not persist raw content merely to
calculate a digest; digest the sanitized representation. If a useful artifact
cannot be safely redacted, store only a controlled external reference and mark
the local evidence limitation. Any unresolved raw secret or PII produces
`redaction_failure` and blocks persistence and readiness.
