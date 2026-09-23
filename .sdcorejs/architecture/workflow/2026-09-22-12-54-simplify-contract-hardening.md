---
approval_source: explicit-user-choice
approved_at: 2026-09-22T05:54:20.528Z
approved_by: user-current-task
artifact_id: architecture-simplify-contract-hardening-20260922-r1
artifact_kind: architecture
change_ref: simplify-contract-hardening-20260922
commit_policy: with-change
contract_id: simplify-contract-hardening-20260922
description: Approved simplify schema, authority, repository observation and downstream evidence boundaries.
execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
name: simplify-contract-hardening-architecture
owner: sdcorejs-architecture
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references:
  - approval_hash: sha256:v1:bdee4c22d47ff2d432b5be1fec86f500829707e4671f784a22d64ab5c0c2c217
    artifact_id: spec-simplify-contract-hardening-20260922-r1
    artifact_kind: spec
    repository_id: github.com/sdcorejs/sdcorejs-agent
    revision: ac820d70bd247a04f977aab9bbb864f6a054acb7
parent_repository_id: null
repository_relative_path: .sdcorejs/architecture/workflow/2026-09-22-12-54-simplify-contract-hardening.md
requirement_id: R-001
schema_version: 1
sourceDraftPath: .sdcorejs/docs/architecture/2026-09-22-12-43-simplify-contract-hardening-architecture.md
source_plan: none
source_revision: ac820d70bd247a04f977aab9bbb864f6a054acb7
source_spec: .sdcorejs/specs/workflow/2026-09-22-12-43-simplify-contract-hardening.md
stack_profile: node-general
supersedes: null
track: workflow
approval_hash: sha256:v1:a16f53efa2547c95fe2ffc282f3cf91b09f46e5970532c0d3fad22def79835f9
---

# Architecture - Simplify contract hardening

**Approved architecture.** The user selected option 1 in the current task. This snapshot freezes only the simplify API, authority, observation, and consumer boundaries. File-by-file implementation belongs to the subsequent plan.

Approved parent: [simplify hardening spec](../../specs/workflow/2026-09-22-12-43-simplify-contract-hardening.md), hash `sha256:v1:bdee4c22d47ff2d432b5be1fec86f500829707e4671f784a22d64ab5c0c2c217`. The parent graph and spec decision coverage have been verified.

## Architecture decisions

| Boundary | Owner and rule |
|---|---|
| Agent payload | One v2 simplify_context; it describes requested action and references evidence, but cannot attest its own authority or writes. |
| Observation | Host adapter captures the actual Git root/index/worktree and runs verification commands; observations are collected independently of scope.files or changed_paths. |
| Decision | Simplify owns schema, authority intersection, preserved-surface checks and pass/rollback validation. Preflight alone may grant writes; postflight only assesses observed results. |
| Consumers | Test, review, repair, ship and portable handoff reuse the same schema/validator and bind current evidence to content. No consumer upgrades limited/stale/legacy evidence. |

### 1. Canonical schema and API

Expose separate preflight and postflight entry points through the existing simplify contract surface, with a common schema validator, explicit legacy adapter and consumer validator. Keep the existing evaluateSimplifyContract export as a compatibility dispatcher; it cannot preserve the unsafe v1 write-authorization behavior. Exact names/signatures are frozen by the implementation plan.

V2 keeps the documented identity, scope, preservation, passes, result, verification and artifact-context families. Add phase, run/change identity, authority references, snapshot references and workflow provenance. Use lowercase command results passed/failed/not-run and one observed passes[].changed_paths projection. Distinguish process result, behavior coverage, freshness and permission; do not emit a catch-all verified claim.

A documented executable example is parsed as the integration-test input. Tests may bind actual temporary-root identities and host-issued receipt references into documented placeholders, but may not add private fields or substitute another schema. Unknown/conflicting version aliases fail closed.

V1 adaptation supports historical reading only. Preserve the original payload and limitations, require fresh v2 preflight for Apply, and reject a legacy pass as current readiness evidence. No behavior oracle means Analyze-only; there is no new limited-write override.

### 2. Authority and phase sequencing

Preflight resolves explicit user authority and, when applicable, a verified approved plan and its exact step from the trusted workflow caller. User scope intersects plan allowed paths, eligible source/hunks and protected exclusions; neither missing nor empty authority becomes whole-repository permission. Scope expansion requires original-scope authority plus a revised plan step when the plan constrains it.

Capture the dirty baseline and run the focused behavior oracle before evaluating preflight. A successful preflight binds its allowed scope to the observed baseline, owner root and run identity. There is no after receipt at this phase. Before each edit boundary, reject changes since the authorized checkpoint or revalidate against a newly authorized scope/baseline.

Postflight resolves the genuine preflight record and obtains fresh repository observations; it compares actual deltas, protected surfaces, pass history and real post-command evidence. It never grants retrospective write_authorized=true. Declared unchanged/reverted/passed fields are projections checked against observations.

Use the existing approved-artifact verifier for authority and integrity. Hashing metadata or a caller-written JSON file does not establish trust: the host must supply the actual authorization provenance and observation/runner records separately from the untrusted context. Missing adapters result in read-only/blocked behavior, not synthetic approval or receipts.

### 3. Snapshot and containment boundary

The observer resolves real Git roots, repository ownership, canonical relative paths and realpath/lstat containment. Validate paths before access and again at edit/capture boundaries. Reject traversal, absolute/drive/UNC paths, sibling-prefix escapes, nested owner mismatches and symlink/junction escape. Unsupported or racy containment fails closed.

Observe the root independently of requested paths: tracked/index state, staged and unstaged bytes, additions/deletions/renames and untracked files, with explicit handling of relevant ignored output. Record snapshot completeness and any host-configured observation exclusions; exclusions never become eligible simplify source. Unknown relevant completeness blocks Apply.

Fingerprint actual bytes, path identity and file modes, and retain index/HEAD identity separately. Include test/oracle/config inputs that affect verification freshness; same HEAD plus different bytes is stale. Required snapshots/temporary byte baselines live outside source paths and remain local-only. Use existing typed snapshot/receipt conventions and approved-artifact hashing; do not label a revision-only repair snapshot as working-tree evidence.

Compare successive full observations before filtering by scope. This catches undeclared generated/protected writes. Bind hunk coordinates to baseline content and compare actual changed ranges, including zero-length insertions and deletions. Map ranges across bounded passes explicitly. Unknown mapping blocks edits. User-owned baseline changes and index state are preserved byte-for-byte outside authorized hunks.

Protected paths and responsibilities retain the existing policy. Language/purpose-specific preservation checks must bind to current content and cover applicable literals, exports, metadata and ordering surfaces. Unsupported language semantics or missing checks downgrade to Analyze-only; this change does not attempt a universal equivalence checker or a whole-pack refactor.

Snapshots observe state at boundaries, not every arbitrary external filesystem operation. This design is an authorization/evidence gate, not an OS sandbox; it makes no claim to protect against a malicious host or to observe a transient write outside its monitored root. The caller must use the validated edit boundaries.

### 4. Runner receipts and pass history

The host runner executes discovered commands and emits receipts only after exit. Each receipt binds the exact nonblank command/argv, real cwd, owner/root, selected coverage/hunks, start/end times, exit code and derived result, output digest, revision and actual content fingerprint. Matching before/after commands must cover the same intended scope. Recheck source before and after execution; a command that changes relevant content cannot certify the earlier or later state as current.

Preserve existing two-pass and file/hunk caps. The host run history owns monotonic pass IDs, checkpoints and the simplify-to-repair handoff; the payload cannot reset counters by sending an empty ledger or scalar depth zero. A repair write ends simplify eligibility for that run. Exact scoped rollback is verified against the saved pre-pass bytes and index state, with unrelated user edits preserved. Never use destructive Git reset/restore.

Postflight checks every pass, including failed/reverted ones, and the final whole-root observation. Omitted or duplicated ledger entries and claims contradicted by snapshots block the run. No pass is accepted solely because its final aggregate command passed.

### 5. Consumer invalidation and portability

Introduce narrow adapters at the existing test/review/repair/ship/portable-handoff entry points. Consumers depend on simplify validation; simplify must not import those consumers or recursively call repair. Shared snapshot/receipt primitives may be factored only as needed without changing unrelated contracts.

Any relevant source/oracle/config write makes affected evidence stale by fingerprint comparison. The original simplify context remains immutable evidence; append new run receipts instead of overwriting it. Test can execute fresh verification, review can report blocked scope/preservation, repair can perform its own authorized bounded fix, and ship can accept only current scoped evidence after all independent gates pass.

Portable handoff preserves v2 identity, phase, authority/snapshot references, scope/hunks, pass history and coverage/freshness limitations. It transports references through existing validated loading; it does not embed raw source, logs, prompts or secrets or manufacture trust from serialized booleans. A host that cannot re-establish provenance cannot authorize Apply or claim current verification.

## Ownership, review and validation

One semantic owner and integration owner: github.com/sdcorejs/sdcorejs-agent, role standalone. No cross-repository implementation is introduced. The existing owner helper has no standalone selector; its integration-owner lookup branch was evaluated with the one-repository topology and returned this owner. No module/portal owner was invented.

INV-001 from the approved spec remains the governing invariant. VAL-001 through VAL-006 map all twelve acceptance criteria to expected executable proof below. They are validation obligations, not claims that implementation tests passed.

Separated read-only self-review: (a) authority never depends on after evidence; (b) the observer cannot use declared scope to discover writes; (c) command identity is content-bound; (d) portability does not upgrade trust; (e) legacy inputs remain read-only; (f) no recursive simplify after repair; (g) immutable approvals and user changes remain protected. The draft does not add dependency, Git delivery, Design or other skill-refactoring scope.

Approval is explicit. The approved parent graph and complete post-approval handoff are verified using repository helpers. The runtime envelope receives this artifact path/hash after creation; the protected hash is not embedded into its own hashed body.

Approval recorded: option 1, explicit user choice. Prepare the implementation plan. Implementation still awaits plan approval.

## Typed architecture context

```yaml
architecture_context:
  schema_version: 1
  source: "sdcorejs-architecture"
  contract_id: "simplify-contract-hardening-20260922"
  requirement_id: "R-001"
  approved_spec_reference: {"repository_id":"github.com/sdcorejs/sdcorejs-agent","artifact_id":"spec-simplify-contract-hardening-20260922-r1","artifact_kind":"spec","revision":"ac820d70bd247a04f977aab9bbb864f6a054acb7","approval_hash":"sha256:v1:bdee4c22d47ff2d432b5be1fec86f500829707e4671f784a22d64ab5c0c2c217"}
  owner_repository_id: "github.com/sdcorejs/sdcorejs-agent"
  owner_module_id: null
  execution_host_repository_id: "github.com/sdcorejs/sdcorejs-agent"
  integration_owner_repository_id: "github.com/sdcorejs/sdcorejs-agent"
  trigger: {"required":true,"signals":["public-api-contract","security-trust-boundary"],"rationale":"The simplify helper/context API and the authority boundary between declared payloads and observed repository/runner evidence change. A lean architecture decision must freeze these boundaries before planning."}
  invariants: [{"id":"INV-001","statement":"Never overwrite user-owned changes, widen protected boundaries, fabricate execution evidence, or alter immutable approvals.","scope":"Simplify preflight, observation, pass finalization, and downstream evidence consumption.","owner":"github.com/sdcorejs/sdcorejs-agent","rationale":"All v2 acceptance claims depend on authority being narrower than declarations and evidence matching actual content.","verification_method":"Actual temporary-repository writes and command execution; documentation-to-helper-to-consumer positive and mutation tests; protected and user-owned byte comparisons.","requirement_refs":["R-002","R-003","R-004","R-005","R-006"],"decision_refs":["D-001","D-002","D-003"]}]
  boundaries: [{"id":"BND-001","statement":"Agent-facing simplify_context is declarative and never supplies its own trusted authority or execution facts.","invariant_refs":["INV-001"]},{"id":"BND-002","statement":"A host-side observation adapter captures the owner root and command results independently of declared scope and pass paths.","invariant_refs":["INV-001"]},{"id":"BND-003","statement":"Downstream consumers validate the canonical context and independently resolve current evidence before accepting a pass.","invariant_refs":["INV-001"]}]
  dependency_directions: [{"from":"simplify observation adapter","to":"existing approved-artifact and typed snapshot/receipt infrastructure","rationale":"Reuse canonical integrity/identity primitives without a new approval hash algorithm.","invariant_refs":["INV-001"]},{"from":"test/review/repair/ship/portable-handoff adapters","to":"simplify canonical schema and handoff validator","rationale":"Consumers share the contract; simplify does not import orchestration consumers and create recursion.","invariant_refs":["INV-001"]}]
  data_state_owners: [{"subject":"User authority, approved plan step, change/run identity and history","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","owner_component":"Host authorization and workflow caller","invariant_refs":["INV-001"]},{"subject":"Observed snapshots, command receipts and current source fingerprint","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","owner_component":"Host evidence capture and command runner","invariant_refs":["INV-001"]},{"subject":"Legacy adaptation and v2 schema/postflight interpretation","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","owner_component":"Simplify contract","invariant_refs":["INV-001"]}]
  public_contracts: [{"id":"API-001","kind":"api","owner":"github.com/sdcorejs/sdcorejs-agent","statement":"Versioned simplify_context with distinct preflight/postflight evaluation, canonical receipt references and consumer validation.","compatibility":"Keep an explicit read-only v1 adapter; legacy verified/limited claims never authorize writes or count as current v2 evidence.","migration":"New Apply callers create a fresh v2 baseline/preflight. Existing immutable approved artifacts are not rewritten.","invariant_refs":["INV-001"]}]
  security_trust_boundaries: [{"id":"TRUST-001","statement":"Caller-supplied lists, statuses, root IDs, hashes and booleans do not prove authority, real changes or successful command execution.","invariant_refs":["INV-001"]},{"id":"TRUST-002","statement":"A missing trusted loader/runner, incomplete inventory or unresolved preservation/containment proof fails closed; hashes are integrity, not signatures or an OS sandbox.","invariant_refs":["INV-001"]}]
  cross_repository_integration: []
  adopted_decision_refs: ["D-001","D-002","D-003"]
  deferred_decision_refs: []
  assumption_refs: []
  validation_obligations: [{"id":"VAL-001","expected_proof":"Retain RED/safe controls and prove one documented v2 payload through each entry point, with v1 read-only downgrade.","owner":"github.com/sdcorejs/sdcorejs-agent","invariant_refs":["INV-001"],"acceptance_criterion_refs":["AC-001","AC-002"]},{"id":"VAL-002","expected_proof":"Prove before-only authority works and out-of-scope, cross-root, path and link escapes deny authority.","owner":"github.com/sdcorejs/sdcorejs-agent","invariant_refs":["INV-001"],"acceptance_criterion_refs":["AC-003","AC-004"]},{"id":"VAL-003","expected_proof":"Observe real omitted writes, hunk drift, user-owned-byte changes and false Analyze claims independently of the payload.","owner":"github.com/sdcorejs/sdcorejs-agent","invariant_refs":["INV-001"],"acceptance_criterion_refs":["AC-005","AC-007"]},{"id":"VAL-004","expected_proof":"Run real focused commands and reject stale/missing/blank/mutated receipts and missing behavior oracles.","owner":"github.com/sdcorejs/sdcorejs-agent","invariant_refs":["INV-001"],"acceptance_criterion_refs":["AC-006","AC-009"]},{"id":"VAL-005","expected_proof":"Derive pass count/rollback/history from observed checkpoints; invalidate consumer evidence after simplify or repair writes.","owner":"github.com/sdcorejs/sdcorejs-agent","invariant_refs":["INV-001"],"acceptance_criterion_refs":["AC-008","AC-010"]},{"id":"VAL-006","expected_proof":"Preserve immutable artifacts and canonical ownership; run scoped checks and generated mirror synchronization without broadening delivery.","owner":"github.com/sdcorejs/sdcorejs-agent","invariant_refs":["INV-001"],"acceptance_criterion_refs":["AC-011","AC-012"]}]
  profile_sections: {"frontend_architecture_ref":null,"agent_architecture_ref":null}
  change_control: {"revision":1,"supersedes":null}
```
