# Product Contract Protocol

This reference is the normative operating contract for `sdcorejs-product`.
Approved requirements define intended behavior; implementation and test state
are descriptive evidence. `_refs/product/product-protocol.mjs` implements a
deterministic subset of these rules and must not be treated as a replacement
for the readable contract.

## Contents

- [Action Contract](#action-contract)
- [Authority Model](#authority-model)
- [Stable Identity](#stable-identity)
- [Requirement Change Control](#requirement-change-control)
- [Document Ownership](#document-ownership)
- [Active And Historical Ledgers](#active-and-historical-ledgers)
- [Write Preflight](#write-preflight)
- [Legacy Compatibility Projection](#legacy-compatibility-projection)
- [Failure Rules](#failure-rules)

## Action Contract

Exactly one action is selected for each invocation. The action boundary is
emitted before target-project reads, commands, or writes. `side_effects_allowed`
states the maximum policy; action prerequisites and path preflight decide
whether a particular write is authorized.

The boundary also records exact `write_policy`, `write_authorized`,
`persistence_requested`, and `requirements_changed` values. A caller may not
widen ownership by supplying an allowlist: concrete `allowed_paths` are
derived from the selected action and validated resolved layout.
Application/source roots, package manifests and lockfiles, skill-pack sources,
Git metadata, generated runtime trees, and every `.sdcorejs` path outside the
canonical product ledger root are prohibited by default. Normative product
documents must resolve beneath an established product- or requirements-marked
document root; merely placing a caller-selected file under `docs/` does not
grant ownership.

| Action | Required authority or input | Side effects | Owned writes | Hard prohibitions |
|---|---|---:|---|---|
| `seed-from-approved-spec` | Stable contract ID, revision 1, non-empty stable requirement IDs, immutable approved spec path/hash, and approval | yes | Initial approved product projections, decision projection, collision-safe current ledger, and active index; history remains empty when no prior current exists | No app code, spec mutation, inferred requirements, or legacy overwrite |
| `requirements-update` | Approved next revision, exact prior revision in `supersedes`, change reason, approval record, new spec path and hash | yes | Revised normative projections, decision projection, new immutable history, current ledger/index | No unapproved behavior change, ID reuse, revision skip, old spec/history mutation, or evidence-only update |
| `traceability-sync` | Exact contract ID, positive revision, approved spec path/hash, explicit evidence array, complete normative before/after snapshots, and integrated changed paths after required fan-in | yes | Derived current ledger, index, and new immutable history under the resolved product ledger ownership | No `product/` requirement prose, IDs, priority, approval, scope, spec, UAT scenario, or decision changes |
| `audit-readonly` | Exact contract ID, positive revision, approved spec path/hash, explicit evidence array, and complete normative before/after snapshots | no | none | No checkpoint, summary refresh, cache, temporary project file, auto-doc, ledger, index, report file, or other write |
| `audit-and-sync` | Every read-only audit prerequisite plus explicit `persistence_requested: true`; preflight later decides `write_authorized` | yes | Derived audit findings in current ledger/index and a new immutable history record | No normative or UAT execution changes |
| `record-uat` | Exact contract/revision/spec path/hash, complete identical normative snapshots, and the complete manual execution record from `_refs/product/evidence-and-uat.md`, including requirement binding, scenario/source identity, preconditions, role, sanitized data/environment, steps/expected/actual results, evidence refs, executor/recorder times, decision, and redaction | yes | Dedicated UAT execution state plus derived current ledger/index/history | No scenario, expected-result, requirement, automated-test, or approval mutation |
| `supersede-feature` | Stable contract ID, approved incremented revision, prior revision in `supersedes`, reason, approved spec path/hash, approval, and replacement contract or superseded lifecycle | yes | Supersession decision/projection, old-contract lifecycle update, new immutable history, replacement link | No deletion, identity reuse, implicit replacement contract, or rewrite of prior history |

The write flag is `false` only for `audit-readonly`; it is `true` for the other
six actions. A write-capable action with missing prerequisites is blocked with
an empty authorized allowlist. It is not downgraded or remapped automatically.

Normative initialization or change may set `requirements_changed: true` only
for `seed-from-approved-spec`, `requirements-update`, and
`supersede-feature`. The four derived actions always emit
`requirements_changed: false` and prove the normative before/after projection
is identical.

## Authority Model

Normative and descriptive sources answer different questions.

| Source | Authority class | Rule |
|---|---|---|
| Immutable approved spec at its recorded hash | normative | Primary behavior contract for its `contract_id` and revision; never edited in place |
| Approved PRD, story, acceptance-criteria, UAT-scenario, and decision projections tied to that spec | normative projection | May be created or revised only by an approved normative action; source references and hashes must remain attached |
| Approved change-control record | normative control | Authorizes one exact revision or supersession; approval cannot be inferred from implementation |
| Approved plan | execution control | Describes delivery work but cannot add, remove, or reinterpret requirements |
| Code, configuration, routes, schemas, permissions, and current diffs | descriptive | Evidence of actual implementation; contradictions become drift |
| Unit, integration, E2E, security, regression, manual checks, and command output | descriptive | Verification evidence only; passing tests cannot redefine the contract |
| UAT execution result | descriptive business acceptance | Records acceptance against an approved scenario; it never changes the scenario or requirement |
| Summaries, memories, old ledgers, and generated reports | descriptive context | Useful for discovery; stale context cannot override current evidence or approved authority |

Caller-supplied paths, hashes, approval fields, and normative projections are
claims, not trusted authority. Before any `READY` or `READY_WITH_WARNINGS`
verdict, `write_authorized: true`, or persisted write, call
`verifyApprovedSpecAuthority` with the absolute repository root and the complete
context. The verifier reads a regular snapshot beneath `.sdcorejs/specs/` and
rejects a symbolic link or junction at the repository root, snapshot, or any
syntactic ancestor segment, even when it resolves back inside the repository.
It applies the shared canonical snapshot-body hash contract
(UTF-8, normalized LF line endings, frontmatter removed, and the single
designated body `approved_spec_hash` mapping line removed), rejects duplicate
hash directives, and checks the digest against both the snapshot and the
context. It also recomputes `approved_spec_integrity_hash` over the complete
normalized snapshot while excluding only that digest's single top-level
frontmatter field. This second digest covers `approvedAt`, `approvedBy`, and
the constrained `approval_source`; changing approval metadata without a new
approved revision invalidates authority. Its approved frontmatter must contain matching `contract_id`,
`feature_id`, positive `requirement_revision`, complete stable `requirement_ids`, `approvedAt`,
`approvedBy`, constrained `approval_source`, `approved_spec_hash`,
`approved_spec_integrity_hash`, and change-control
revision. Approval metadata, repository root, snapshot path, contract and feature identity,
revision, requirement IDs, and hash must all cross-bind to the context.
The only executable approval source is `explicit-user-choice`. Imported approved
specs and equivalent complete inputs are provenance for a draft, not executable
authority; the user must explicitly accept the exact immutable snapshot before
the integrity hash and approval metadata can authorize execution.

Pass only the verifier's in-process result as
`validateProductContext(..., { trusted_authority: result })`. The validator
rejects a copied, serialized, reconstructed, caller-authored, missing, stale, or
mismatched result. The trusted result also contains the `requirements`,
`requirement_field_hashes`, and `requirement_source_hashes` projected from the
approved-spec bytes for every active requirement. Both normative snapshots must
match the complete projection and both hash maps exactly. `deriveTraceability`
must consume that projection whenever it compares observed behavior. Caller-authored
requirement prose, priority, source, or expected behavior cannot replace it or
erase drift. These tokens are preflight evidence only. Immediately before
a ready verdict or write, call `authorizeProductContext`; it re-reads and
re-hashes the relevant filesystem paths, exact approved spec, and exact
approved plan, then validates the plan and its approved-spec chain through the
shared approved-plan integrity contract. The final gate binds the plan path,
body hash, integrity hash, contract, feature, revision, complete requirement ID
set, product action, and target root to the current context and spec authority.
Caller-supplied plan hashes are comparison claims only; the final one-shot
authorization records the values observed from the approved-plan file. The gate
also treats the file-observed plan `allowed_paths` and `prohibited_paths` as the
maximum write boundary. The context allowlist must be equal to or narrower than
that boundary, and every planned, actual, or deleted persisted path must match a
plan allow pattern and no plan prohibition. Matching uses the shared approved-
plan canonical repository-relative path, supported glob, target-root, and
platform case semantics. An `audit-readonly` context remains valid only with an
empty context allowlist and zero persisted paths, even when its approved plan
records a broader maximum scope. Product document and derived-ledger authority
are independent: a plan lists `product/**` and `.sdcorejs/docs/product/**` only
when each tree is explicitly approved; neither tree implies the other.
The same final gate calls `observeProductLayoutState` and recursively enumerates
regular, non-linked `.sdcorejs/docs/product/**/current.md` files. It binds the
complete matching contract/feature candidate set and content hashes to the
decision. A context cannot hide a second active ledger by omitting it from
`layout.active_candidates`.
The gate validates with a private one-shot capability. For a planned pre-write
context with no observed writes, the parent must pass bounded `executeWrite`
and `observeWriteResult` callbacks. After the final reads and validation, the
gate consumes its capability and invokes the writer with the closed request
`{ repository_root, context_digest, current_state_digest, planned_writes,
request_digest }`. The writer returns `completed: true`, exact request/context
digests, `actual_writes`, `deleted_paths`, and an SHA-256
`after_status_digest`. The gate binds that receipt to a parent-observed
post-write result. Receipt and observation path sets/status must match, show a
real change, and stay within the planned set. Only then can `authorized: true`
and `write_executed: true` prove completed in-gate execution. They are not
reusable permission. No second write may occur outside the gate. A post-write
context is authorized by a fresh, validation-only call. This applies to
`write_authorized: true` and any planned, actual, or deleted persisted write
even when the verdict is non-ready. A token minted before later filesystem
mutation cannot authorize completion.

When any row claims `implementation_status: not_applicable` or
`verification_status: not_applicable`, the parent also supplies
`observeDecisionSet`. Final authorization calls
`observeProductDecisionAuthority` before the final file-backed reads and sends
one closed request containing the complete canonical decision set plus the
context, readiness, post-integration-state, lifecycle, and write-set digests.
The observer must return the exact request/decision/context/state bindings.
`deriveFeatureVerdict` consumes the resulting opaque capability once for the
whole row set; it must not require or mint one token per row. Direct
`deriveRequirementReadiness` consumes the same capability for its single bound
row. Forged, stale, copied, replayed, or missing capabilities block
`not_applicable` readiness.

For a context carrying UAT records, final authorization derives the exact
canonical scenario source refs from the records, hashes those repository files,
and invokes a parent-owned asynchronous build-identity observer. The resulting
WeakSet-backed observation is bound into the one-shot decision. Caller-authored
`uat_scenario_hashes` and `uat_build_or_revision` are comparison claims only and
cannot independently support current UAT.

For `READY` or `READY_WITH_WARNINGS`, final authorization also invokes
parent-owned automated-evidence and manual-UAT execution observers for the exact
IDs bound by the ready rows. Closed observed projections must exactly match the
recorded command/result/output/path state and manual executor/time/result/
decision/build state. The protocol binds them into an opaque, in-process,
one-shot attestation. Raw evidence or UAT records cannot mint that attestation.
All parent-observer waits complete before the gate's final relevant-file,
approved-spec, and approved-plan re-reads; no observer wait may intervene
between those reads and the one-shot decision.
These callbacks are a host trust boundary rather than cryptographic proof; a
malicious or compromised host can lie. Implement them from the actual runner,
report collector, or authorized UAT system, never by echoing the untrusted
context under validation.

`audit-readonly` always passes through final authorization, including blocked
or non-ready audit results. The parent supplies both `observeAuditStatus` and
`executeAudit`; the gate calls `observeAuditReadonlyState` in the exact order
`observeStatus(before) -> executeAudit -> observeStatus(after)`. The audit
executor receives `{ repository_root, request_digest }` and must return the
closed result `{ completed: true, request_digest }` with the exact digest. The
gate then requires equal request-bound SHA-256 repository-status observations
and consumes the opaque proof once. A missing executor, an audit outside this
bracket, caller-authored equal strings, or replayed observations fail closed.

Every exported validation, authority, current-state observation, and final
authorization boundary fails closed on malformed outer objects, nested records,
and collection values. It returns deterministic validation errors or
`verified: false` / `authorized: false`; it must not throw or treat malformed
input as an empty valid request.

An immutable legacy snapshot without `approved_spec_integrity_hash` cannot
authorize new product readiness or writes. Preserve it unchanged and create a
new explicitly approved spec revision; never backfill or rewrite its approval.

When normative sources conflict with one another, record
`conflicting_authority`, block readiness, and stop normative writes until the
approved source is resolved. When code or tests contradict approved intent,
preserve the requirement unchanged and record `implementation_drift`. Code and
tests agreeing with each other does not remove drift when both disagree with
the approved source.

An explicit user request to change observable behavior is not approval by
itself unless it is already represented by the repository's approved change
control. Route an unapproved request through `sdcorejs-brainstorming` and
`sdcorejs-spec` before executing `requirements-update`.

## Stable Identity

Identity is contract-first:

- `contract_id` comes from the approved upstream contract and remains stable
  through requirement revisions. A slug, title, directory, or timestamp is
  never the primary key.
- `feature_id` is a stable feature label within the contract. `feature_slug` is
  display and path metadata only.
- `requirement_revision` starts at 1 and increments by exactly one for a
  material revision. The new revision records `supersedes` as the prior
  revision, not merely a path.
- Every requirement keeps its approved stable ID across reorder, wording
  projection, implementation, and test changes. Use forms such as `AC-001` for
  new examples and new approved contracts.
- Active and retired ID arrays contain no duplicates, and one ID cannot appear
  in both collections.
- A removed requirement moves to `retired_requirement_ids` and remains in
  immutable history. Retired IDs are never reactivated or assigned to a new
  requirement.
- Preserve a non-hyphenated legacy literal ID as its identity. A display alias
  such as `AC-001` may be recorded, but it must never replace, renumber, or
  collide with the original ID.
- Same-slug contracts remain isolated. The fallback `contract_key` combines a
  normalized feature identity with a deterministic digest of `contract_id`.

Every normative projection records the approved spec path, anchor when
available, approved spec hash, source requirement hash, contract ID, revision,
and approval reference. A hash mismatch is a different authority state, not a
formatting change.

## Requirement Change Control

A material change includes behavior, acceptance, scope, priority, permission,
route, workflow, API or data shape, validation, ownership, removal, or a new
user-visible deliverable. It requires:

```yaml
change_control:
  contract_id: "{stable contract ID}"
  requirement_revision: "{prior revision plus one}"
  supersedes: "{prior revision}"
  change_reason: "{approved reason}"
  approved_spec_path: "{immutable approved snapshot path}"
  approved_spec_hash: "{sha256}"
  source_requirement_hash: "{sha256}"
  approval:
    approved: true
    approved_by: "{recorded approver identity}"
    approved_at: "{ISO-8601 timestamp}"
    approval_source: "explicit-user-choice"
```

`requirements-update` validates the prior and next identity with
`validateIdentityTransition`. Added requirements use new approved IDs. Removed
IDs are retired. Unchanged requirements keep their IDs even when reordered.
The previous spec, product projection, current-ledger snapshot, and history
files stay immutable.

`supersede-feature` increments the old contract's revision and marks its
feature lifecycle `superseded`. A replacement is a separate contract with its
own `contract_id`; `replacement_contract_id` links them without transferring
or reusing identity.

## Document Ownership

| Artifact | Content owner | Actions allowed to write |
|---|---|---|
| `.sdcorejs/specs/{track}/{approved-spec}.md` | `sdcorejs-spec` | none in this skill |
| Existing approved PRD, stories, acceptance criteria, and UAT scenario definitions | product normative projection | `seed-from-approved-spec`, `requirements-update`, `supersede-feature` as authorized |
| Product decisions projection | approved change control | `seed-from-approved-spec`, `requirements-update`, `supersede-feature` |
| `.sdcorejs/docs/product/{contract-key}/current.md` or uniquely established equivalent | derived active ledger | every write-capable product action within its field ownership |
| `.sdcorejs/docs/product/{contract-key}/history/{revision-record}.md` | immutable product history | create only; never edit, rename, or delete |
| Dedicated UAT execution records | UAT execution state | `record-uat` only; derived actions may read and index them |
| Legacy timestamped ledgers | historical source | read and link only |
| Project summary, task checkpoint, memory, or user guide | owning shared workflow | never by `audit-readonly`; other actions use only their separately declared shared policy |

Normative product projections contain localized human-facing requirement text.
The derived ledger does not copy that prose. It stores stable IDs, source paths,
anchors, hashes, artifact references, statuses, gaps, and evidence IDs.

## Active And Historical Ledgers

The detailed read-discovery algorithm is in `_refs/product/traceability.md`.
The write layout obeys these invariants:

1. Existing target layout wins when one current ledger and its product docs are
   uniquely attributable to the exact `contract_id` and safe to update.
2. If no safe established layout exists, call `resolveProductLayout`. The
   fallback is `.sdcorejs/docs/product/{contract-key}/current.md` with immutable
   history under `history/` and UAT execution state under `uat/`.
3. Exactly one current ledger is discoverable per feature contract. Multiple
   candidates, a same-path different-contract record, or an identity-free
   ambiguous legacy candidate is blocking and receives no write.
   Final authorization independently confirms this set with
   `observeProductLayoutState`; an incoming context or discovery hint cannot
   narrow the file-backed candidate list.
4. Before replacing current derived state, create a new history record such as
   `history/r002-{timestamp}.md` containing the prior ledger identity and
   digest. If that history path already exists with different bytes, choose a
   collision-safe new suffix; never overwrite it.
5. Legacy timestamped files remain at their original paths. Add only a
   `legacy_history` link/index record after ownership and dirty-path checks.
   Never delete, rename, normalize in place, or use a legacy file as the new
   current path.
6. Superseded contracts retain a current ledger whose feature lifecycle is
   `superseded`; a replacement contract has its own current ledger.

## Write Preflight

Perform this sequence after the action boundary and before mutation:

1. Resolve repository root, target root kind, branch, HEAD, staged paths,
   unstaged paths, untracked paths, and the before-status digest.
2. Resolve exact normative authority with `verifyApprovedSpecAuthority`. Refuse
   a missing/non-regular snapshot, symlink or repository escape, body-hash
   mismatch, incomplete approved frontmatter, unknown contract identity,
   cross-binding mismatch, or conflicting authority. Do not substitute a
   caller-authored object for the returned trusted result. Use its projected
   `requirements`, `requirement_field_hashes`, and `requirement_source_hashes`
   for behavior drift and exact normative snapshot validation.
3. Discover established product paths and current/history/legacy ledgers for
   the exact contract. Detect same-slug and active-path collisions, then compare
   the result with the trusted file-backed candidate set from
   `observeProductLayoutState`.
4. Expand the action's owned artifact classes into explicit normalized
   repository-relative `allowed_paths`, `planned_writes`, and
   `prohibited_paths`. Planned writes include additions, modifications,
   deletions, and both sides of a rename. Reject absolute paths, Windows
   drive-relative paths such as `C:../...`, parent traversal, symlink escape,
   nested-repository escape, and case-normalized collision.
5. Compare every planned path with existing staged, unstaged, and untracked
   dirt, including equal and parent/child overlap. A dirty write overlap stops
   before writing and requires one numbered user decision. Unrelated dirt is
   recorded and preserved, not included in `actual_writes`.
6. Capture `normative_before` and the proposed `normative_after`. Derived
   actions require byte-equivalent deterministic projections and
   `requirements_changed: false`. Bind contract, revision, immutable spec
   path/hash, active requirement IDs, and retired requirement IDs to the
   top-level context. An approved revision also requires a different immutable
    spec path and hash from its predecessor.
7. Require exact row coverage for every active requirement even for blocked,
   stale, or partial results. Empty rows are valid only for an explicitly
   superseded or retired feature with no active requirements. For passed
   row-bound evidence, require its trusted relevant-path manifest to contain the
   approved-spec source, every implementation ref, every recorded test/artifact
   path, and the expected-result spec ref. Bind evidence to contract, feature,
   revision, spec body hash, and spec integrity hash.
8. Call `validateProductAction`, `validateIdentityTransition` when applicable,
    and `validateActionSideEffects`, then pass the trusted authority and observed
    current-state results to `validateProductContext` for synchronous
    pre-validation. Continue only with no errors and no required user choice.
    If implementation or verification has an approved `not_applicable`
    decision, pass the parent-owned `observeDecisionSet` callback so one
    request-bound capability validates the complete decision set.
    Immediately before a proposed write, call `authorizeProductContext` with the
   write-authorized context and parent-owned bounded `executeWrite` and
   `observeWriteResult` callbacks. The gate validates, invokes the writer, and
   verifies a request-bound receipt against the parent-observed post-write path
   sets and status digest itself; do not perform a second
   write from the returned result. Because the write changes filesystem state,
   call `authorizeProductContext` again after all writes and evidence updates before
   publishing a ready verdict; an earlier decision is not reusable.
9. After writing, recompute actual added, modified, deleted, and renamed paths.
   Validate the actual set against the same boundary and prove no legacy path
   or out-of-scope file changed.

For `audit-readonly`, pass parent-owned `observeAuditStatus` and `executeAudit`
callbacks to `authorizeProductContext`. Its internal
`observeAuditReadonlyState` call observes before state, executes the exact audit,
then observes after state. It binds both SHA-256 status digests and the audit
executor's closed `{ completed: true, request_digest }` response to the exact
request, requires equality, consumes the resulting one-shot proof, and keeps
allowed, planned, actual, and deleted path sets empty. A missing executor, an
audit outside the bracket, caller-supplied matching digests, or prose is not
zero-write proof.

No write is allowed merely because a path appears under `product/` or
`.sdcorejs/docs/product/`; ownership must also match the exact contract and
selected action.

## Legacy Compatibility Projection

The former labels are accepted only as input aliases and are never execution
modes:

| Legacy input | Unambiguous projection |
|---|---|
| `Seed` | `seed-from-approved-spec` only when an immutable approved spec path, hash, and stable identity are present |
| `Audit` | `audit-readonly` by default; `audit-and-sync` only when persistence is explicitly requested and authorized |
| `Update` | `requirements-update` for an approved normative revision; `traceability-sync` for derived implementation/test evidence; `record-uat` for an explicit UAT result |

Reject `Update` when the request does not prove which of those three meanings
applies. Ask one numbered choice before project access. Never choose the
write-capable interpretation by convenience, and never map a failed action to a
different action silently.

Legacy timestamped ledgers without stable identity are discovery candidates,
not authority. Link them only after a unique contract mapping is proven. An
ambiguous mapping produces `legacy_ambiguity` and leaves every legacy file
unchanged.

## Failure Rules

- Validator success is necessary but not sufficient; apply all readable rules.
- Unknown approval, identity, authority, freshness, ownership, or redaction
  fails closed for any passing or write claim.
- A forbidden or dirty-overlap write discovered before execution stops without
  mutation. A discovered post-write violation is `BLOCKED`, preserves exact
  evidence, and must not be reported as synchronized.
- A derived action that changes a normative field is invalid even when the
  resulting code and tests pass.
- A failed or blocked action emits a complete redacted `product_context` with
  errors, gaps, planned and actual paths, and a non-ready verdict.
- Product verdicts do not replace `sdcorejs-ship` verification or branch-ready
  gates.
